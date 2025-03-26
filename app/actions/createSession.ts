"use server";
import { createAdminClient } from "@/config/appwrite";
import { cookies } from "next/headers";

export async function createSession(
  prevState: { error: string; success?: boolean } | undefined, // Add `success` to the type
  formData: FormData
): Promise<{ error: string; success?: boolean } | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "Please fill out the requirements",
    };
  }

  //Get Account instance
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(email, password);

    //create cookie
    cookies().set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(session.expire),
      path: "/",
    });

    return { error: "", success: true };
  } catch (error) {
    console.log("Authentication error " + error);
    return { error: "Invalid credentials" };
  }

  return { error: "", success: true };

  console.log(email, password);
}
