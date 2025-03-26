"use server";
import { createAdminClient } from "@/config/appwrite";
import checkAuth from "./checkAuth";
import { ID, Models } from "node-appwrite";
import { revalidatePath } from "next/cache";

interface ErrorWithMessage {
  response?: { message: string };
}

type CreateRoomResponse = {
  success?: boolean;
  error?: string;
  roomData?: Models.Document;
};

type FormDataType = {
  get: (key: string) => string | File | null;
};

async function createRoom(
  previousState: unknown,
  formData: FormDataType
): Promise<CreateRoomResponse> {
  // Get databases instance
  const { databases, storage } = await createAdminClient();

  const storageBucketId =
    process.env.NEXT_PUBLIC_APPWRITE_ROOMS_STORAGE_BOOKING;
  if (!storageBucketId) {
    throw new Error(
      "Storage bucket ID is not defined. Check your environment variables."
    );
  }

  try {
    const { user } = await checkAuth();

    if (!user) {
      return {
        error: "You must be logged in to create a room",
      };
    }

    // Uploading image
    let imageID: string | undefined;

    const image = formData.get("image") as File | null;

    if (image && image.size > 0 && image.name !== "undefined") {
      try {
        // Upload
        const response = await storage.createFile(
          storageBucketId,
          ID.unique(),
          image
        );
        imageID = response.$id;
      } catch (error) {
        console.log("Error uploading image", error);
        return {
          error: "Error uploading image",
        };
      }
    } else {
      console.log("No image file provided or file is invalid");
    }

    // Create room
    const newRoom = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS!,
      ID.unique(),
      {
        user_id: user.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        sqft: formData.get("sqft") as string,
        capacity: formData.get("capacity") as string,
        location: formData.get("location") as string,
        address: formData.get("address") as string,
        availability: formData.get("availability") as string,
        price_per_hour: formData.get("price_per_hour") as string,
        amenities: formData.get("amenities") as string,
        image: imageID,
        created_at: new Date().toISOString(),
      }
    );

    revalidatePath("/", "layout");

    return {
      success: true,
      roomData: newRoom,
    };
  } catch (error) {
    const typedError = error as ErrorWithMessage;
    console.log(typedError);
    const errorMessage =
      typedError.response?.message || "An unexpected error has occurred";
    return {
      error: errorMessage,
    };
  }
}

export default createRoom;
