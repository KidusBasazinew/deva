"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";

async function getMyRooms() {
  const sessionCookie = cookies().get("appwrite-session");

  if (!sessionCookie) {
    redirect("/sign-in");
  }

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

  if (!databaseId || !collectionId) {
    throw new Error(
      "Appwrite database or collection environment variables are missing."
    );
  }

  try {
    const { account, databases } = await createSessionClient(
      sessionCookie.value
    );

    // Get user's ID
    const user = await account.get();
    const userId = user.$id;

    // Fetch users rooms
    const { documents: rooms } = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal("user_id", userId)]
    );

    return rooms;
  } catch (error) {
    console.log("Failed to get user rooms", error);
    redirect("/error");
  }
}

export default getMyRooms;
