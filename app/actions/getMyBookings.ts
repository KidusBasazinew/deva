"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";

async function getMyBookings() {
  const sessionCookie = cookies().get("appwrite-session");
  if (!sessionCookie) {
    redirect("/sign-in");
  }

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const bookingId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS;

  if (!databaseId || !bookingId) {
    throw new Error(
      "Appwrite database or collection environment variables are missing."
    );
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const { user } = await checkAuth();
    if (!user) {
      console.error("User authentication failed");
      return []; // Return an empty array on error
    }

    const { documents: booking } = await databases.listDocuments(
      databaseId,
      bookingId,
      [Query.equal("user_id", user.id)]
    );

    return booking;
  } catch (error) {
    console.error("Failed to get user bookings", error);
    return []; // Return an empty array on error
  }
}

export default getMyBookings;
