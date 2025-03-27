"use client";
import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "appwrite";

interface Withdrawal {
  $id: string;
  userId: string;
  depositId: string;
  bankAccount: string;
  amount: number;
  status: string;
}

export default function WithdrawalApprovalPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const { databases } = await createAdminClient();
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_WITHDRAWN_COLLECTION!,
        [Query.equal("status", "pending")]
      );
      setWithdrawals(response.documents as unknown as Withdrawal[]);
    };
    fetchWithdrawals();
  }, []);

  const handleApprove = async (withdrawalId: string) => {
    const { databases } = await createAdminClient();

    // Update withdrawal status
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_WITHDRAWN_COLLECTION!,
      withdrawalId,
      { status: "approved" }
    );

    // Update deposit amount to 0
    const withdrawal = withdrawals.find((w) => w.$id === withdrawalId);
    if (withdrawal) {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
        withdrawal.depositId,
        { amount: 100, isWithdrawn: true }
      );
    }

    setWithdrawals(withdrawals.filter((w) => w.$id !== withdrawalId));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Pending Withdrawals</h1>
      {withdrawals.map((withdrawal) => (
        <div key={withdrawal.$id} className="border p-4 mb-4">
          <div className="mb-2">
            <p>Bank Account: {withdrawal.bankAccount}</p>
            <p>Amount: ${withdrawal.amount.toFixed(2)}</p>
          </div>
          <button
            onClick={() => handleApprove(withdrawal.$id)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
