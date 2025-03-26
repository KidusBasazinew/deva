"use server";
import { cookies } from "next/headers";
import checkAuth from "./checkAuth";
import { createAdminClient } from "../../config/appwrite";
import { ID, Models, Query } from "appwrite";

const HOURLY_INTEREST_RATE = 0.1; // 0.1% per hour
const LOCK_PERIOD_DAYS = 30;

interface Deposit extends Models.Document {
  amount: number;
  startDate: string;
  interestRate: number;
  userId: string;
  isWithdrawn: boolean;
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
      deposit.amount,
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

export async function withdrawDeposit(depositId: string) {
  const { databases } = await createAdminClient();
  const deposit = await databases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE as string,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION as string,
    depositId
  );

  const startDate = new Date(deposit.startDate);
  const lockEnd = new Date(startDate);
  lockEnd.setDate(lockEnd.getDate() + LOCK_PERIOD_DAYS);

  if (new Date() < lockEnd) {
    return { error: "Deposit is still locked for withdrawal" };
  }

  await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE as string,
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION as string,
    depositId,
    {
      isWithdrawn: true,
    }
  );

  return { success: true };
}
