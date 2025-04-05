"use client";
import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { ID, Query } from "appwrite";
import Image from "next/image";

interface PendingDeposit {
  $id: string;
  userId: string;
  imageId: string;
  status: string;
  amount: number;
}

const HOURLY_INTEREST_RATE = 0.1;

const getReferralPercentage = (count: number): number => {
  if (count < 5) return 5;
  if (count < 10) return 7;
  return 10;
};

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
    try {
      return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${imageId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
    } catch {
      return "/fallback-image.jpg"; // Add a fallback image
    }
  };

  const handleApprove = async (deposit: PendingDeposit) => {
    const { databases } = await createAdminClient();

    // Validate amount
    if (isNaN(deposit.amount)) {
      alert("Invalid deposit amount");
      return;
    }

    try {
      // Create main deposit
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

      // Update pending status
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_PENDING_COLLECTION!,
        deposit.$id,
        { status: "approved" }
      );

      // Check for referrals
      const referralResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
        [Query.equal("referredUser", deposit.userId)]
      );

      if (referralResponse.documents.length > 0) {
        const referrerUserId = referralResponse.documents[0].userId;

        // Get referrer's current referral count
        const referrerData = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
          [Query.equal("userId", referrerUserId)]
        );

        const referralCount = referrerData.documents[0]?.referralCount || 0;
        const percentage = getReferralPercentage(referralCount);
        const bonusAmount = (deposit.amount * percentage) / 100;

        // Update referral count
        if (referrerData.documents.length > 0) {
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
            process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
            referrerData.documents[0].$id,
            { referralCount: referralCount + 1 }
          );
        }

        // Add referral bonus
        const referrerDeposits = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
          [
            Query.equal("userId", referrerUserId),
            Query.equal("isWithdrawn", false),
            Query.equal("type", "referral_bonus"),
          ]
        );

        if (referrerDeposits.documents.length === 0) {
          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
            ID.unique(),
            {
              userId: referrerUserId,
              amount: bonusAmount,
              initialAmount: bonusAmount,
              totalWithdrawn: 0,
              startDate: new Date().toISOString(),
              interestRate: HOURLY_INTEREST_RATE,
              isWithdrawn: false,
              type: "referral_bonus",
            }
          );
        } else {
          const existingDeposit = referrerDeposits.documents[0];
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
            existingDeposit.$id,
            { amount: existingDeposit.amount + bonusAmount }
          );
        }
      }

      setPendingDeposits((prev) => prev.filter((d) => d.$id !== deposit.$id));
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to process approval");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Pending Deposits</h1>
      {pendingDeposits.map((deposit) => (
        <div key={deposit.$id} className="border p-4 mb-4">
          <Image
            width={400}
            height={400}
            src={getImageUrl(deposit.imageId)}
            alt="Deposit proof"
            className="w-64 h-64 object-cover"
            // Add these props for external images
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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
