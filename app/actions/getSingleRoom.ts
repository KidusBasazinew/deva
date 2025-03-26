"use server";

import { createAdminClient } from "@/config/appwrite";
import { Room } from "@/Types/Room";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getSingleRoom(id: string): Promise<Room | null> {
  try {
    const { databases } = await createAdminClient();

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

    if (!databaseId || !collectionId) {
      throw new Error(
        "Appwrite database or collection environment variables are missing."
      );
    }

    // Fetch rooms
    const document = await databases.getDocument(databaseId, collectionId, id);

    const room: Room = {
      $id: document.$id,
      name: document.name,
      description: document.description,
      image: document.image,
      price_per_hour: document.price_per_hour,
      address: document.address,
      capacity: document.capacity,
      availability: document.availability,
      amenities: document.amenities,
    };

    // Revalidate the cache for this path
    revalidatePath("/", "layout");

    return room;
  } catch (error) {
    console.log("Failed to get room", error);
    redirect("/error");
  }
}

export default getSingleRoom;
