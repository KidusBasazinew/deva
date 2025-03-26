"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import checkAuth from "./checkAuth";

async function cancelBooking(bookedId: string) {
  const sessionCookie = cookies().get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const bookingsId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS;

  if (!databaseId || !bookingsId) {
    throw new Error(
      "Appwrite database or collection environment variables are missing."
    );
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Get user's ID
    const { user } = await checkAuth();

    if (!user) {
      return {
        error: "You must be logged in to cancel a booking",
      };
    }

    console.log("Attempting to cancel booking with ID:", bookedId);

    // Get the booking
    const booking = await databases.getDocument(
      databaseId,
      bookingsId,
      bookedId
    );

    console.log("Booking details:", booking);

    // Check if booking belongs to current user
    if (booking.user_id !== user.id) {
      return {
        error: "You are not authorized to cancel this booking",
      };
    }

    // Delete booking
    await databases.deleteDocument(databaseId, bookingsId, bookedId);

    revalidatePath("/bookings", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.log("Failed to cancel booking", error);
    return {
      error: "Failed to cancel booking",
    };
  }
}

export default cancelBooking;
