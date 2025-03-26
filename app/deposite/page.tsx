"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from "react";

import Link from "next/link";
import {
  createDeposit,
  getDeposits,
  withdrawDeposit,
} from "../actions/deposite";
import { useAuth } from "@/context/authContext";

const initialState = { error: "", success: false };

export default function DepositPage() {
  const { currentUser } = useAuth();
  const [state, formAction] = useFormState(createDeposit, initialState);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      getDeposits().then(setDeposits);
    }
  }, [currentUser]);

  const handleWithdraw = async (depositId: string) => {
    const result = await withdrawDeposit(depositId);
    if (result.success) {
      setDeposits((prev) => prev.filter((d) => d.$id !== depositId));
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6">Deposit System</h1>

        <form action={formAction} className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Deposit Amount
            </label>
            <input
              type="number"
              name="amount"
              className="p-2 border rounded w-full"
              min="1"
              required
            />
          </div>
          <button type="submit" className="w-full">
            Create Deposit
          </button>
          {state.error && <p className="text-red-500 mt-2">{state.error}</p>}
        </form>

        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-4">Active Deposits</h2>
          {deposits.length === 0 ? (
            <p>No active deposits</p>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.$id} className="border p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>Initial Amount: ${deposit.amount.toFixed(2)}</p>
                      <p>Current Value: ${deposit.currentValue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(deposit.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleWithdraw(deposit.$id)}>
                      Withdraw
                    </button>
                  </div>
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
