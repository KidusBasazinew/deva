"use server";
import { createAdminClient } from "@/config/appwrite";
import { ID } from "node-appwrite";

async function createUser(
  prevState: { error: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error: string; success?: boolean } | undefined> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

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
  const { account } = await createAdminClient();

  try {
    // Create user
    await account.create(ID.unique(), email, password, name);

    return {
      error: "",
      success: true,
    };
  } catch (error) {
    console.log("Registration Error: ", error);
    return {
      error: "Could not register user",
    };
  }
}

export default createUser;
