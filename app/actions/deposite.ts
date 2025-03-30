"use server";

import checkAuth from "./checkAuth";
import { createAdminClient } from "../../config/appwrite";
import { ID, Models, Query } from "appwrite";

const HOURLY_INTEREST_RATE = 0.1; // 0.1% per hour
// const LOCK_PERIOD_SECONDS = 3; // 3-second withdrawal lock for testing

export interface Deposit extends Models.Document {
  amount: number;
  initialAmount: number;
  totalWithdrawn: number;
  startDate: string;
  interestRate: number;
  userId: string;
  isWithdrawn: boolean;
  type?: "regular" | "referral_bonus";
  referredUser?: string;
}

interface FormState {
  error: string;
  success: boolean;
}

export async function createPackageDeposit(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await checkAuth();
  if (!user) return { error: "Not authenticated", success: false };

  const { databases, storage } = await createAdminClient();

  // Check for existing deposit
  const existing = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    [Query.equal("userId", user.id), Query.equal("isWithdrawn", false)]
  );

  if (existing.documents.length > 0) {
    return { error: "You already have an active deposit", success: false };
  }

  const amount = Number(formData.get("amount"));
  const imageFile = formData.get("deposit-proof") as File;

  if (isNaN(amount)) return { error: "Invalid amount", success: false };
  if (!imageFile) return { error: "Deposit proof required", success: false };

  try {
    const imageResponse = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      imageFile
    );

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
      ID.unique(),
      {
        userId: user.id,
        imageId: imageResponse.$id,
        amount,
        status: "pending",
      }
    );

    return { success: true, error: "" };
  } catch (error) {
    console.error("Deposit error:", error);
    return { error: "Failed to create deposit", success: false };
  }
}

export async function approveDepositRequest(userId: string, amount: number) {
  const { databases } = await createAdminClient();
  await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    ID.unique(),
    {
      userId,
      amount,
      initialAmount: amount,
      totalWithdrawn: 0,
      startDate: new Date().toISOString(),
      interestRate: HOURLY_INTEREST_RATE,
      isWithdrawn: false,
      type: "regular",
    } as Deposit
  );
}

export async function getDeposits() {
  const { user } = await checkAuth();
  if (!user) return [];

  const { databases } = await createAdminClient();
  const response = await databases.listDocuments<Deposit>(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE as string,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION as string,
    [Query.equal("userId", user.id), Query.equal("isWithdrawn", false)]
  );

  const deposit = response.documents[0];
  if (!deposit) return [];

  return [
    {
      ...deposit,
      currentValue: calculateCurrentValue(
        deposit.amount,
        new Date(deposit.startDate),
        deposit.interestRate,
        deposit.totalWithdrawn
      ),
    },
  ];
}

function calculateCurrentValue(
  amount: number,
  startDate: Date,
  interestRate: number,
  totalWithdrawn: number
) {
  const now = new Date();
  const hoursElapsed = Math.floor(
    (now.getTime() - startDate.getTime()) / 1000 / 3600
  );
  const accrued = amount * Math.pow(1 + interestRate / 100, hoursElapsed);
  return accrued - totalWithdrawn;
}

export async function withdrawDeposit(depositId: string, bankAccount: string) {
  const { databases } = await createAdminClient();

  try {
    const deposit = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
      depositId
    );

    if (!deposit.amount || !deposit.startDate) {
      return { error: "Invalid deposit data" };
    }

    const currentValue = calculateCurrentValue(
      deposit.amount,
      new Date(deposit.startDate),
      deposit.interestRate,
      deposit.totalWithdrawn
    );

    const startDate = new Date(deposit.startDate);
    const lockEnd = new Date(startDate.getTime() + 3000);

    if (new Date() < lockEnd) {
      return { error: "Withdrawals locked for first 3 seconds" };
    }

    const secondsSinceLockEnd = Math.ceil(
      (Date.now() - lockEnd.getTime()) / 1000
    );
    const daysSinceLockEnd = Math.floor(secondsSinceLockEnd / 86400);

    const maxDailyAllowance = deposit.initialAmount * 0.1;
    const totalAllowance = maxDailyAllowance * (daysSinceLockEnd + 1);
    const availableFromBalance = currentValue - deposit.totalWithdrawn;

    const availableToWithdraw = Math.min(
      totalAllowance - deposit.totalWithdrawn,
      availableFromBalance
    );

    if (availableToWithdraw <= 0) {
      return { error: "No available funds to withdraw right now" };
    }

    // Only create withdrawal document without updating deposit
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_WITHDRAWN_COLLECTION!,
      ID.unique(),
      {
        userId: deposit.userId,
        depositId: deposit.$id,
        bankAccount,
        amount: availableToWithdraw,
        createdAt: new Date().toISOString(),
        status: "pending",
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Withdrawal error:", error);
    return { error: "Failed to process withdrawal" };
  }
}

export async function incrementDeposit(userId: string, amount: number) {
  const { databases } = await createAdminClient();

  const deposits = await databases.listDocuments<Deposit>(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    [Query.equal("userId", userId), Query.equal("isWithdrawn", false)]
  );

  if (deposits.documents.length === 0) {
    return await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
      ID.unique(),
      {
        userId,
        amount,
        initialAmount: amount,
        totalWithdrawn: 0,
        startDate: new Date().toISOString(),
        interestRate: HOURLY_INTEREST_RATE,
        isWithdrawn: false,
        type: "referral_bonus",
      }
    );
  }

  const deposit = deposits.documents[0];
  return await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    deposit.$id,
    {
      amount: deposit.amount + amount,
      type: deposit.type === "regular" ? "regular" : "referral_bonus",
    }
  );
}
