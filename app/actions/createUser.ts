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

    // Create referral document with referralCount
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
      ID.unique(),
      {
        userId: user.$id,
        email: user.email,
        name: user.name,
        referralCode: user.$id,
        referralCount: 0, // Initialize count
        referredUsers: "", // Add array to track referrals
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
        const inviterDoc = inviter.documents[0];
        const inviterUserId = inviterDoc.userId;

        // Update inviter's referral count
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
          inviterDoc.$id,
          {
            referralCount: (inviterDoc.referralCount || 0) + 1,
            referredUsers: (inviterDoc.referredUsers || "") + "," + user.$id, // Append user ID as string
          }
        );

        // Process bonus using percentage-based system
        await incrementDeposit(inviterUserId, 400);
      }
    }

    return { error: "", success: true };
  } catch (error) {
    console.error("Registration Error: ", error);
    return { error: "Could not register user" };
  }
}

export default createUser;
