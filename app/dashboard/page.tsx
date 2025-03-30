"use client";

import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "appwrite";
import checkAuth from "@/app/actions/checkAuth";

export default function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState("");
  const [totalBonus, setTotalBonus] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await checkAuth();
      if (!user) return;

      const { databases } = await createAdminClient();
      const users = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
        [Query.equal("userId", user.id)]
      );

      if (users.documents.length > 0) {
        setReferralCode(users.documents[0].referralCode);
      }

      const deposits = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
        [Query.equal("userId", user.id), Query.equal("amount", 400)]
      );

      setTotalBonus(deposits.total * 400);
    };

    fetchData();
  }, []);

  const referralLink = `${window.location.origin}/sign-up?referral=${referralCode}`;

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-2xl mx-auto">
      {" "}
      {/* Updated width */}
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Your Referral Dashboard</h2>

        {/* <div className="form-control w-full">
          
          
          <label className="label">
            <span className="label-text">Your Referral Code</span>
          </label>
          <div className="badge badge-info badge-lg p-4 text-lg w-full justify-center">
            {referralCode}
          </div>
        </div> */}

        <div className="form-control w-full">
          {" "}
          {/* Added w-full */}
          <label className="label">
            <span className="label-text">Your Referral Link</span>
          </label>
          <div className="join w-full">
            {" "}
            {/* Added w-full */}
            <input
              type="text"
              value={referralLink}
              className="input input-bordered join-item w-full" /* Ensured full width */
              readOnly
            />
            <button
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="btn btn-primary join-item"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="alert alert-success mt-4 w-full">
          {" "}
          {/* Added w-full */}
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
          <div className="w-full">
            <h3 className="font-bold">Total Referral Bonus: ${totalBonus}</h3>
            <div className="text-xs">
              Each successful referral adds $400 to your deposits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
