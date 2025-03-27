"use server";

import { createAdminClient } from "@/config/appwrite";
import { ID } from "node-appwrite";
import { Query } from "appwrite";
import { Deposit } from "./deposite";

async function createUser(
  prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error: string; success?: boolean } | undefined> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;
  const referralCode = formData.get("referral-code") as string;

  if (!email || !name || !password) {
    return {
      error: "Please fill in all fields",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
    };
  }

  // Get account instance
  const { account, databases } = await createAdminClient();

  try {
    // Create user
    const user = await account.create(ID.unique(), email, password, name);

    // Generate referral code (using user ID)
    const userReferralCode = user.$id;

    // Save user to 'users' collection with referral code
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!, // Ensure this collection exists
      ID.unique(),
      {
        userId: user.$id,
        email: user.email,
        name: user.name,
        referralCode: userReferralCode,
      }
    );

    // Process referral code
    if (referralCode) {
      // Find inviter by referral code
      const inviter = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
        [Query.equal("referralCode", referralCode)]
      );

      if (inviter.documents.length > 0) {
        const inviterUserId = inviter.documents[0].userId;

        // Add 400 to inviter's deposit
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
          ID.unique(),
          {
            userId: inviterUserId,
            amount: 400,
            startDate: new Date().toISOString(),
            interestRate: 0.1, // Match HOURLY_INTEREST_RATE from deposite.ts
            isWithdrawn: false,
          } as Deposit
        );
      }
    }

    return { error: "", success: true };
  } catch (error) {
    console.log("Registration Error: ", error);
    return { error: "Could not register user" };
  }
}

export default createUser;
