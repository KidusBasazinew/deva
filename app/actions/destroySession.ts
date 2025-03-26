"use server";
import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";

export async function destroySession(): Promise<
  { error: string; success?: boolean } | undefined
> {
  const cookieSession = cookies().get("appwrite-session");

  if (!cookieSession) {
    return {
      error: "No session cookie found",
    };
  }

  try {
    const { account } = await createSessionClient(cookieSession.value);

    // Delete current session
    await account.deleteSession("current");

    // Clear session cookie
    cookies().delete("appwrite-session");

    return {
      error: "",
      success: true,
    };
  } catch (error) {
    console.log("Authentication error " + error);
    return {
      error: "Error deleting session",
    };
  }
}
