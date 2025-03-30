"use client";
import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { ID, Query } from "appwrite";

interface PendingDeposit {
  $id: string;
  userId: string;
  imageId: string;
  status: string;
  amount: number;
}

const HOURLY_INTEREST_RATE = 0.1;

export default function AdminApprovalPage() {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      const { databases } = await createAdminClient();
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
        [Query.equal("status", "pending")]
      );

      // Explicitly map documents to PendingDeposit type
      const validatedDeposits = response.documents.map((doc) => ({
        $id: doc.$id,
        userId: doc.userId,
        imageId: doc.imageId,
        status: doc.status,
        amount: Number(doc.amount),
      })) as PendingDeposit[];

      setPendingDeposits(validatedDeposits);
    };
    fetchPending();
  }, []);

  const getImageUrl = (imageId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${imageId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
  };

  const handleApprove = async (deposit: PendingDeposit) => {
    const { databases } = await createAdminClient();

    // Validate amount before proceeding
    if (isNaN(deposit.amount)) {
      alert("Invalid deposit amount");
      return;
    }

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
      ID.unique(),
      {
        userId: deposit.userId,
        amount: deposit.amount,
        initialAmount: deposit.amount,
        totalWithdrawn: 0,
        startDate: new Date().toISOString(),
        interestRate: HOURLY_INTEREST_RATE,
        isWithdrawn: false,
        type: "regular",
      }
    );

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
      deposit.$id,
      { status: "approved" }
    );

    setPendingDeposits((prev) => prev.filter((d) => d.$id !== deposit.$id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Pending Deposits</h1>
      {pendingDeposits.map((deposit) => (
        <div key={deposit.$id} className="border p-4 mb-4">
          <img
            src={getImageUrl(deposit.imageId)}
            alt="Deposit proof"
            className="w-64 h-64 object-cover"
          />
          <div className="mt-2">
            {/* Safe number formatting with fallback */}
            <p className="font-bold">
              Amount: ${deposit.amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <button
            onClick={() => handleApprove(deposit)}
            className="bg-blue-500 text-white p-2 mt-2"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
