"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";
import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";
import { ID } from "node-appwrite";
import checkRoomAvailability from "./checkRoomAvailability";

async function bookRoom(previousState: unknown, formData: FormData) {
  const sessionCookie = cookies().get("appwrite-session");
  if (!sessionCookie) {
    redirect("/sign-in");
  }

  // Use the checkAuth function to get the user
  const { user } = await checkAuth();
  if (!user) {
    return { error: "You must be signed in" };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");
    const roomId = formData.get("room_id");

    if (!roomId || typeof roomId !== "string") {
      return { error: "Room ID is required and must be a string" };
    }

    // Create DateTime objects and convert them to ISO strings
    const checkInDateTime = DateTime.fromISO(`${checkInDate}T${checkInTime}`, {
      zone: "utc",
    });
    const checkInDateTimeString = checkInDateTime.toISO();

    const checkOutDateTime = DateTime.fromISO(
      `${checkOutDate}T${checkOutTime}`,
      { zone: "utc" }
    );
    const checkOutDateTimeString = checkOutDateTime.toISO();

    // Check if room is available
    const availabilityCheck = await checkRoomAvailability(
      roomId,
      checkInDateTimeString!,
      checkOutDateTimeString!
    );

    // If availabilityCheck is a string, return it as an error message
    if (typeof availabilityCheck === "string") {
      return {
        error: availabilityCheck, // Error message
      };
    }

    const bookingData = {
      check_in: checkInDateTimeString,
      check_out: checkOutDateTimeString,
      user_id: user.id,
      room_id: roomId,
    };

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS;

    if (!collectionId || !databaseId) {
      throw new Error("Booking collection ID is missing.");
    }

    console.log("Booking Data:", bookingData); // Log to inspect booking data

    // Ensure you're passing the bookingData object correctly
    await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      bookingData
    );

    console.log(2);

    // Revalidate the cache to reflect the new booking
    revalidatePath("/bookings", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to book room:", error);
    return {
      error: `Something went wrong booking the room: ${error}`,
    };
  }
}

export default bookRoom;
