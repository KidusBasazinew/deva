"use client";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import {
  createPackageDeposit,
  Deposit,
  getDeposits,
  withdrawDeposit,
} from "../actions/deposite";
import { useAuth } from "@/context/authContext";
import { createAdminClient } from "@/config/appwrite";
import { Models, Query } from "node-appwrite";
import Image from "next/image";

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
        <div className="flex justify-center items-center mb-8 p-4 bg-base-100 rounded-xl shadow-lg border border-base-300">
          <div className="flex gap-6">
            <button
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                activeTab === "deposit"
                  ? "bg-blue-800 text-white ring-2 ring-blue-400"
                  : "bg-base-200 hover:bg-base-300 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("deposit")}
            >
              <div className="p-2 bg-white/10 rounded-full mb-2">
                <Image
                  src="/deposit.png"
                  width={48}
                  height={48}
                  alt="Deposit"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="font-semibold text-sm">Deposit</span>
            </button>

            <button
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                activeTab === "active"
                  ? "bg-emerald-800 text-white ring-2 ring-emerald-400"
                  : "bg-base-200 hover:bg-base-300 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("active")}
            >
              <div className="p-2 bg-white/10 rounded-full mb-2">
                <Image
                  src="/wallet.png"
                  width={48}
                  height={48}
                  alt="Active Deposits"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="font-semibold text-sm">Active</span>
            </button>

            <button
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                activeTab === "withdraw"
                  ? "bg-purple-800 text-white ring-2 ring-purple-400"
                  : "bg-base-200 hover:bg-base-300 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("withdraw")}
            >
              <div className="p-2 bg-white/10 rounded-full mb-2">
                <Image
                  src="/withdrawal.png"
                  width={48}
                  height={48}
                  alt="Withdraw"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="font-semibold text-sm">Withdraw</span>
            </button>
          </div>
        </div>

        {activeTab === "deposit" && (
          /* Deposit Section */
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Investment Plans</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <form
                    key={pkg.amount}
                    action={formAction}
                    className={`card shadow-md transition-all duration-300 ${
                      selectedPackage === pkg.amount
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:shadow-xl"
                    }`}
                    onClick={() => setSelectedPackage(pkg.amount)}
                  >
                    <div className="card-body">
                      {/* Package Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{pkg.label}</h3>
                        {selectedPackage === pkg.amount && (
                          <div className="badge badge-primary badge-lg">
                            Selected
                          </div>
                        )}
                      </div>

                      {/* Package Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">
                            Investment Amount
                          </span>
                          <span className="font-bold text-primary">
                            ETB {pkg.amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Duration</span>
                          <span className="font-medium">{pkg.days} Days</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Daily Returns</span>
                          <span className="font-bold text-secondary">
                            ETB {pkg.dailyIncome}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Total Returns</span>
                          <span className="font-bold text-accent">
                            ETB {pkg.totalIncome}
                          </span>
                        </div>
                      </div>

                      {/* File Input */}
                      {selectedPackage === pkg.amount && (
                        <div className="mt-6 space-y-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">
                                Upload Payment Proof
                              </span>
                            </label>
                            <input
                              type="file"
                              name="deposit-proof"
                              accept="image/*"
                              className="file-input file-input-bordered file-input-primary w-full"
                              required
                            />
                          </div>

                          <input
                            type="hidden"
                            name="amount"
                            value={pkg.amount}
                          />

                          <button
                            type="submit"
                            className="btn btn-primary w-full gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Invest Now
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                ))}
              </div>

              {/* Status Messages */}
              {state.error && (
                <div className="alert alert-error mt-6">
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
                <div className="alert alert-success mt-6">
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
