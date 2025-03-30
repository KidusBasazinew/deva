"use client";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createPackageDeposit,
  Deposit,
  getDeposits,
  withdrawDeposit,
} from "../actions/deposite";
import { useAuth } from "@/context/authContext";
import { createAdminClient } from "@/config/appwrite";
import { Models, Query } from "node-appwrite";

const packages = [
  { amount: 100, label: "Starter Package" },
  { amount: 500, label: "Premium Package" },
  { amount: 1000, label: "VIP Package" },
];
interface Withdrawal extends Models.Document {
  amount: number;
  bankAccount: string;
  status: "pending" | "approved" | "rejected";
  userId: string;
  depositId: string;
}
export default function DepositPage() {
  const { currentUser } = useAuth();
  const [state, formAction] = useFormState(createPackageDeposit, {
    error: "",
    success: false,
  });
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>(
    []
  );

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      if (currentUser) {
        const { databases } = await createAdminClient();
        const response = await databases.listDocuments<Withdrawal>(
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
    <div className="min-h-screen bg-base-200 p-4 mt-6">
      <div className="container mx-auto max-w-3xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <Link href="/" className="btn btn-ghost mb-4 self-start">
              ← Back to Home
            </Link>

            <h1 className="card-title text-3xl mb-6">Investment Packages</h1>

            <form action={formAction}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {packages.map((pkg) => (
                  <button
                    key={pkg.amount}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.amount)}
                    className={`btn btn-outline h-32 flex flex-col ${
                      selectedPackage === pkg.amount ? "btn-primary" : ""
                    }`}
                  >
                    <div className="text-xl font-bold">{pkg.label}</div>
                    <div className="text-lg">${pkg.amount}</div>
                  </button>
                ))}
              </div>

              <input type="hidden" name="amount" value={selectedPackage} />

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Upload Payment Proof</span>
                </label>
                <input
                  type="file"
                  name="deposit-proof"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Submit Investment
              </button>

              {state.error && (
                <div className="alert alert-error mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{state.error}</span>
                </div>
              )}
              {state.success && (
                <div className="alert alert-success mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Deposit submitted for approval!</span>
                </div>
              )}
            </form>

            {/* Active Deposits Section */}
            <div className="divider mt-8"></div>
            <h2 className="card-title text-2xl mb-4">Active Deposits</h2>
            {deposits.length === 0 ? (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Your deposit request is pending admin approval</span>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div key={deposit.$id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            Initial Amount:{" "}
                            <span className="badge badge-primary">
                              ${deposit.initialAmount.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-lg">
                            Current Value:{" "}
                            <span className="badge badge-secondary">
                              ${deposit.currentValue.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(deposit.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="w-full md:w-64 mt-4 md:mt-0">
                          <input
                            type="text"
                            placeholder="Bank Account Number"
                            className="input input-bordered w-full mb-2"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                          />
                          <button
                            onClick={() => handleWithdraw(deposit.$id)}
                            disabled={
                              !bankAccount.trim() ||
                              withdrawingId === deposit.$id
                            }
                            className={`btn w-full ${
                              bankAccount.trim() &&
                              withdrawingId !== deposit.$id
                                ? "btn-accent"
                                : "btn-disabled"
                            }`}
                          >
                            {withdrawingId === deposit.$id ? (
                              <>
                                <span className="loading loading-spinner"></span>
                                Processing...
                              </>
                            ) : (
                              "Withdraw Funds"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Withdrawals Section */}
            <div className="divider mt-8"></div>
            <h2 className="card-title text-2xl mb-4">Pending Withdrawals</h2>
            {pendingWithdrawals.length === 0 ? (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>No pending withdrawal requests</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.$id}
                    className="card bg-base-100 shadow-md"
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-medium">
                            Amount:{" "}
                            <span className="badge badge-primary">
                              ${withdrawal.amount.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested:{" "}
                            {new Date(
                              withdrawal.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge badge-warning badge-lg">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
