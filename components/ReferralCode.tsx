"use client";

import { useAuth } from "@/context/authContext";
import { useState } from "react";

const ReferralCode = () => {
  const { currentUser } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const referralUrl = `${window.location.origin}/sign-up?referral=${currentUser?.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your Referral Code</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={referralUrl}
          readOnly
          className="flex-1 p-2 border rounded-md bg-gray-50"
        />
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Share this link with friends. When they sign up using your link,
        you&apos;ll get 400 added to your deposit!
      </p>
    </div>
  );
};

export default ReferralCode;
