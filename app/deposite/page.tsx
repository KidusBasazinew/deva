"use client";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createPackageDeposit,
  getDeposits,
  withdrawDeposit,
} from "../actions/deposite";
import { useAuth } from "@/context/authContext";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "node-appwrite";

const packages = [
  { amount: 100, label: "Starter Package" },
  { amount: 500, label: "Premium Package" },
  { amount: 1000, label: "VIP Package" },
];

export default function DepositPage() {
  const { currentUser } = useAuth();
  const [state, formAction] = useFormState(createPackageDeposit, {
    error: "",
    success: false,
  });
  const [deposits, setDeposits] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number>(100);
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null); // Track ongoing withdrawals

  useEffect(() => {
    if (currentUser) {
      getDeposits().then(setDeposits);
    }
  }, [currentUser]);

  const handleWithdraw = async (depositId: string) => {
    if (!bankAccount) {
      alert("Please enter a bank account number");
      return;
    }

    setWithdrawingId(depositId); // Disable button during process
    try {
      const result = await withdrawDeposit(depositId, bankAccount);
      if (result.success) {
        // Refresh withdrawals list instead of deposits
        alert("Withdrawal request submitted for approval!");
        setBankAccount("");
      } else {
        alert(result.error);
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  // Add this new section to show pending withdrawals
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      if (currentUser) {
        const { databases } = await createAdminClient();
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
          process.env.NEXT_PUBLIC_APPWRITE_WITHDRAWN_COLLECTION!,
          [
            Query.equal("userId", currentUser.id),
            Query.equal("status", "pending"),
          ]
        );
        setPendingWithdrawals(response.documents);
      }
    };
    fetchPendingWithdrawals();
  }, [currentUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6">Investment Packages</h1>

        <form action={formAction} className="mb-8">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {packages.map((pkg) => (
              <button
                key={pkg.amount}
                type="button"
                onClick={() => setSelectedPackage(pkg.amount)}
                className={`p-4 border rounded ${
                  selectedPackage === pkg.amount
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
              >
                <h3 className="font-bold">{pkg.label}</h3>
                <p>${pkg.amount}</p>
              </button>
            ))}
          </div>

          <input type="hidden" name="amount" value={selectedPackage} />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Payment Proof
            </label>
            <input
              type="file"
              name="deposit-proof"
              accept="image/*"
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit Investment
          </button>

          {state.error && <p className="text-red-500 mt-2">{state.error}</p>}
          {state.success && (
            <p className="text-green-500 mt-2">
              Deposit submitted for approval!
            </p>
          )}
        </form>

        {/* Active Deposits Section */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-4">Active Deposits</h2>
          {deposits.length === 0 ? (
            <p>Your deposit request is pending admin approval.</p>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.$id} className="border p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>Initial Amount: ${deposit.initialAmount.toFixed(2)}</p>
                      <p>Current Value: ${deposit.currentValue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(deposit.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        placeholder="Bank Account Number"
                        className="mt-2 p-2 border rounded"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                      />
                      <button
                        onClick={() => handleWithdraw(deposit.$id)}
                        disabled={
                          !bankAccount.trim() || withdrawingId === deposit.$id
                        }
                        className={`mt-2 p-2 rounded text-white ${
                          bankAccount.trim() && withdrawingId !== deposit.$id
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {withdrawingId === deposit.$id
                          ? "Processing..."
                          : "Withdraw"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Pending Withdrawals Section */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-4">Pending Withdrawals</h2>
          {pendingWithdrawals.length === 0 ? (
            <p>No pending withdrawal requests</p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.$id} className="border p-4 rounded">
                  <p>Amount: ${withdrawal.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    Requested:{" "}
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-yellow-600">
                    Status: Pending Approval
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/" className="mt-4 inline-block text-blue-500">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
