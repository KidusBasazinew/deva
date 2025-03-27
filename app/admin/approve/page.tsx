"use client";
import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { ID, Query } from "appwrite";
import { approveDepositRequest } from "@/app/actions/deposite";

interface PendingDeposit {
  $id: string;
  userId: string;
  imageId: string;
  status: string;
}

export default function AdminApprovalPage() {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchPending = async () => {
      const { databases } = await createAdminClient();
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
        [Query.equal("status", "pending")]
      );
      setPendingDeposits(response.documents as unknown as PendingDeposit[]);
    };
    fetchPending();
  }, []);

  // Correct image URL construction
  const getImageUrl = (imageId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${imageId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
  };

  const handleApprove = async (deposit: PendingDeposit) => {
    if (!amounts[deposit.$id] || amounts[deposit.$id] <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    await approveDepositRequest(deposit.userId, amounts[deposit.$id]);

    const { databases } = await createAdminClient();
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
      deposit.$id,
      { status: "approved" }
    );

    setPendingDeposits(pendingDeposits.filter((d) => d.$id !== deposit.$id));
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
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 m-2"
            onChange={(e) =>
              setAmounts((prev) => ({
                ...prev,
                [deposit.$id]: Number(e.target.value),
              }))
            }
          />
          <button
            onClick={() => handleApprove(deposit)}
            className="bg-blue-500 text-white p-2"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
