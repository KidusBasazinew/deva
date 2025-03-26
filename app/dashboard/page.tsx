"use client";

import { useAuth } from "@/context/authContext";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [referralUrl, setReferralUrl] = useState("");

  useEffect(() => {
    // This code runs only on the client side after mount
    if (typeof window !== "undefined" && currentUser?.id) {
      setReferralUrl(
        `${window.location.origin}/sign-up?referral=${currentUser.id}`
      );
    }
  }, [currentUser]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome {currentUser?.name}</h1>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            value={referralUrl}
            className="flex-1 p-2 border rounded"
            readOnly
          />
          <button
            onClick={() => {
              if (referralUrl) {
                navigator.clipboard.writeText(referralUrl);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Each successful referral earns you $400 immediately!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
