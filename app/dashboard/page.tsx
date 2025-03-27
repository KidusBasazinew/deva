// components/ReferralDashboard.tsx
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

      // Get user's referral code
      const { databases } = await createAdminClient();
      const users = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        "users",
        [Query.equal("userId", user.id)]
      );

      if (users.documents.length > 0) {
        setReferralCode(users.documents[0].referralCode);
      }

      // Get referral bonuses
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Referral Dashboard</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Your Referral Code:
        </label>
        <div className="p-3 bg-gray-100 rounded-md">{referralCode}</div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Your Referral Link:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            className="flex-1 p-2 bg-gray-100 rounded-md"
            readOnly
          />
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h3 className="font-medium text-green-800">
          Total Referral Bonus: ${totalBonus}
        </h3>
        <p className="text-sm text-green-700 mt-1">
          Each successful referral adds $400 to your deposits
        </p>
      </div>
    </div>
  );
}
