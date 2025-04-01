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
  {
    amount: 380,
    label: "Gold Investment Plan 1",
    days: 30,
    dailyIncome: 171,
    totalIncome: 6669,
  },
  {
    amount: 760,
    label: "Gold Investment Plan 2",
    days: 30,
    dailyIncome: 171,
    totalIncome: 6669,
  },
  {
    amount: 1140,
    label: "Gold Investment Plan 3",
    days: 30,
    dailyIncome: 171,
    totalIncome: 6669,
  },
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
  const [selectedPackage, setSelectedPackage] = useState<number>(380);
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "active">(
    "deposit"
  );

  useEffect(() => {
    if (currentUser) {
      getDeposits().then(setDeposits);
    }
  }, [currentUser]);

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

  const handleWithdraw = async () => {
    if (!bankAccount) {
      alert("Please enter a bank account number");
      return;
    }

    setWithdrawingId("withdraw");
    try {
      const result = await withdrawDeposit(deposits[0].$id, bankAccount);
      if (result.success) {
        alert("Withdrawal request submitted for approval!");
        setBankAccount("");
      } else {
        alert(result.error);
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 mt-12">
      <div className="container mx-auto max-w-5xl">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-8 p-4 bg-base-100 rounded-lg shadow">
          <div className="flex gap-4">
            <button
              className={`btn ${
                activeTab === "deposit" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setActiveTab("deposit")}
            >
              Deposit
            </button>
            <button
              className={`btn ${
                activeTab === "active" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Deposits
            </button>
            <button
              className={`btn ${
                activeTab === "withdraw" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setActiveTab("withdraw")}
            >
              Withdraw
            </button>
            {/* <button className="btn btn-ghost">Service</button> */}
          </div>
          {/* <Link href="/" className="btn btn-ghost">
            ← Back
          </Link> */}
        </div>

        {activeTab === "deposit" && (
          /* Deposit Section */
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Investment Plans</h2>

              <form action={formAction}>
                <div className="grid grid-cols-1 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.amount}
                      className="bg-base-200 p-6 rounded-xl"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                        <div>
                          <input
                            type="radio"
                            name="selectedPackage"
                            value={pkg.amount}
                            checked={selectedPackage === pkg.amount}
                            onChange={() => setSelectedPackage(pkg.amount)}
                            className="mr-2"
                          />
                          <label className="text-2xl font-bold">
                            {pkg.label}
                          </label>

                          <div className="space-y-2 mt-2">
                            <div className="flex gap-4">
                              <span className="font-semibold">Price:</span>
                              <span className="text-primary">
                                ETB {pkg.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="font-semibold">Days:</span>
                              <span>{pkg.days}</span>
                            </div>
                            <div className="flex gap-4">
                              <span className="font-semibold">
                                Daily Income:
                              </span>
                              <span className="text-secondary">
                                ETB {pkg.dailyIncome}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="font-semibold">
                                Total Income:
                              </span>
                              <span className="text-accent">
                                ETB {pkg.totalIncome}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Show file input only for the selected package */}
                      {selectedPackage === pkg.amount && (
                        <div className="form-control mt-4 w-full">
                          <label className="label">
                            <span className="label-text">
                              Upload Payment Proof
                            </span>
                          </label>
                          <input
                            type="file"
                            name="deposit-proof"
                            accept="image/*"
                            className="file-input file-input-bordered w-full"
                            required
                          />
                        </div>
                      )}

                      {/* Hidden input to submit the selected package */}
                      <input
                        type="hidden"
                        name="amount"
                        value={selectedPackage}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary mt-4 md:mt-0 px-8 py-3"
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
                </div>

                {/* ... (keep existing error/success messages) */}
              </form>

              {/* Active Deposits */}
              {/* <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Active Deposits</h3>
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
                    <span>No active deposits</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deposits.map((deposit) => (
                      <div
                        key={deposit.$id}
                        className="bg-base-200 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              Initial Amount: ETB{" "}
                              {deposit.initialAmount.toFixed(2)}
                            </p>
                            <p className="font-medium">
                              Current Value: ETB{" "}
                              {deposit.currentValue.toFixed(2)}
                            </p>
                            <p className="text-sm">
                              Started:{" "}
                              {new Date(deposit.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
            </div>
          </div>
        )}

        {activeTab === "active" && (
          /* Active Deposits Section */
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Active Investments</h2>

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
                  <span>No active investments found</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div
                      key={deposit.$id}
                      className="bg-base-200 p-6 rounded-xl"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start">
                        <div className="space-y-2 w-full">
                          <h3 className="text-xl font-bold">
                            {deposit.packageName}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Initial Amount
                              </p>
                              <p className="font-bold text-primary">
                                ETB {deposit.initialAmount.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Current Value
                              </p>
                              <p className="font-bold text-secondary">
                                ETB {deposit.currentValue.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Start Date
                              </p>
                              <p className="font-medium">
                                {new Date(
                                  deposit.startDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Days Remaining
                              </p>
                              <p className="font-medium">
                                {deposit.daysRemaining}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "withdraw" && (
          /* Withdrawal Section */
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Withdrawal</h2>

              {/* Withdrawal Form */}
              <div className="bg-base-200 p-6 rounded-xl mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Bank Account Number"
                    className="input input-bordered w-full md:w-96"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={!bankAccount.trim() || !!withdrawingId}
                    className={`btn btn-accent w-full md:w-auto ${
                      !bankAccount.trim() ? "btn-disabled" : ""
                    }`}
                  >
                    {withdrawingId ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      "Request Withdrawal"
                    )}
                  </button>
                </div>
              </div>

              {/* Pending Withdrawals */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Pending Withdrawals
                </h3>
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
                        className="bg-base-200 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              Amount: ETB {withdrawal.amount.toFixed(2)}
                            </p>
                            <p className="text-sm">
                              Requested:{" "}
                              {new Date(
                                withdrawal.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="badge badge-warning">Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
