"use server";
import { createAdminClient } from "@/config/appwrite";
import { ID } from "node-appwrite";
import { Query } from "appwrite";
import { Deposit, incrementDeposit } from "./deposite";

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
    return { error: "Please fill in all fields" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { account, databases } = await createAdminClient();

  try {
    const user = await account.create(ID.unique(), email, password, name);

    // Generate referral code
    const userReferralCode = user.$id;

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
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
      const inviter = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
        [Query.equal("referralCode", referralCode)]
      );

      if (inviter.documents.length > 0) {
        const inviterUserId = inviter.documents[0].userId;
        await incrementDeposit(inviterUserId, 400);

        // Add missing required fields for Deposit
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
          ID.unique(),
          {
            userId: inviterUserId,
            amount: 400,
            initialAmount: 400, // Added required field
            totalWithdrawn: 0, // Added required field
            startDate: new Date().toISOString(),
            interestRate: 0.1,
            isWithdrawn: false,
            type: "referral_bonus",
            referredUser: user.$id,
          } as Deposit
        );
      }
    }

    return { error: "", success: true };
  } catch (error) {
    console.error("Registration Error: ", error);
    return { error: "Could not register user" };
  }
}

export default createUser;
