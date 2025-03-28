"use server";
import { cookies } from "next/headers";
import checkAuth from "./checkAuth";
import { createAdminClient } from "../../config/appwrite";
import { ID, Models, Query } from "appwrite";

const HOURLY_INTEREST_RATE = 0.1; // 0.1% per hour
const LOCK_PERIOD_DAYS = 0;

export interface Deposit extends Models.Document {
  amount: number;
  startDate: string;
  interestRate: number;
  userId: string;
  isWithdrawn: boolean;
  type?: "regular" | "referral_bonus"; // Add this
  referredUser?: string; // Add this
}

export async function createPackageDeposit(prevState: any, formData: FormData) {
  const { user } = await checkAuth();
  if (!user) return { error: "Not authenticated" };

  const amount = Number(formData.get("amount"));
  const imageFile = formData.get("deposit-proof") as File;

  if (isNaN(amount)) return { error: "Invalid amount" };
  if (!imageFile) return { error: "Deposit proof required" };

  const { databases, storage } = await createAdminClient();

  try {
    // Upload image
    const imageResponse = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      imageFile
    );

    // Create pending deposit
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
    return { error: "Failed to create deposit" };
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
      startDate: new Date().toISOString(),
      interestRate: HOURLY_INTEREST_RATE,
      isWithdrawn: false,
      type: "regular",
    } as Deposit
  );
}

export async function createDeposit(prevState: any, formData: FormData) {
  const { user } = await checkAuth();
  if (!user) return { error: "Not authenticated" };

  const amount = Number(formData.get("amount"));
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };

  const { databases } = await createAdminClient();

  //("main","deposites",ID.unique(),
  // {
  //   userId: user.id,
  //   amount,
  //   startDate: new Date().toISOString(),
  //   interestRate: HOURLY_INTEREST_RATE,
  //   isWithdrawn: false,
  // } as Deposit)
  try {
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!, // Your database ID
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!, // Collection ID
      ID.unique(),
      {
        userId: user.id,
        amount,
        startDate: new Date().toISOString(),
        interestRate: HOURLY_INTEREST_RATE,
        isWithdrawn: false,
      } as Deposit
    );

    return { success: true, error: "" };
  } catch (error) {
    console.error("Deposit error:", error);
    return { error: "Failed to create deposit" };
  }
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

  return response.documents.map((deposit) => ({
    ...deposit,
    currentValue: calculateCurrentValue(
      deposit.amount, // This now includes referral bonuses
      new Date(deposit.startDate),
      deposit.interestRate
    ),
  }));
}
function calculateCurrentValue(
  amount: number,
  startDate: Date,
  interestRate: number
) {
  const now = new Date();
  const hoursElapsed = Math.floor(
    (now.getTime() - startDate.getTime()) / 1000 / 3600
  );
  return amount * Math.pow(1 + interestRate / 100, hoursElapsed);
}

export async function withdrawDeposit(depositId: string, bankAccount: string) {
  const { databases } = await createAdminClient();
  const deposit = await databases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    depositId
  );

  const startDate = new Date(deposit.startDate);
  const lockEnd = new Date(startDate);
  lockEnd.setDate(lockEnd.getDate() + LOCK_PERIOD_DAYS);

  if (new Date() < lockEnd) {
    return { error: "Deposit is still locked for withdrawal" };
  }

  // Create withdrawal request
  await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_WITHDRAWN_COLLECTION!, // New collection
    ID.unique(),
    {
      userId: deposit.userId,
      depositId: deposit.$id,
      bankAccount,
      amount: deposit.amount,
      createdAt: new Date().toISOString(),
      status: "pending",
    }
  );

  return { success: true };
}

export async function incrementDeposit(userId: string, amount: number) {
  const { databases } = await createAdminClient();

  // Find active deposit
  const deposits = await databases.listDocuments<Deposit>(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    [Query.equal("userId", userId), Query.equal("isWithdrawn", false)]
  );

  if (deposits.documents.length === 0) {
    // Create new deposit if none exists
    return await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
      ID.unique(),
      {
        userId,
        amount,
        startDate: new Date().toISOString(),
        interestRate: HOURLY_INTEREST_RATE,
        isWithdrawn: false,
      }
    );
  }

  // Update existing deposit
  const deposit = deposits.documents[0];
  return await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
    deposit.$id,
    { amount: deposit.amount + amount }
  );
}
