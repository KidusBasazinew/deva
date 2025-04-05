"use client";
import { useEffect, useState } from "react";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "appwrite";
import checkAuth from "@/app/actions/checkAuth";

const getCurrentPercentage = (count: number): number => {
  if (count < 5) return 5;
  if (count < 10) return 7;
  return 10;
};

export default function Team() {
  const [totalBonus, setTotalBonus] = useState(0);
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await checkAuth();
      if (!user) return;

      const { databases } = await createAdminClient();

      const usersResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_REFERRAL_COLLECTION!,
        [Query.equal("userId", user.id)]
      );

      if (usersResponse.documents.length > 0) {
        const referralDoc = usersResponse.documents[0];
        const code = referralDoc.referralCode;
        const count = referralDoc.referralCount || 0;

        setReferralCount(count);
        setCurrentPercentage(getCurrentPercentage(count));
        setReferralLink(`${window.location.origin}/sign-up?referral=${code}`);
      }

      const depositsResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION!,
        [Query.equal("userId", user.id), Query.equal("type", "referral_bonus")]
      );

      const total = depositsResponse.documents.reduce(
        (sum, doc) => sum + doc.amount,
        0
      );
      setTotalBonus(total);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-6 mt-14">
      <div className="card bg-base-200 shadow-xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          🎉 Your Referral Dashboard
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-base-100 p-4 rounded-xl shadow text-center">
            <div className="text-sm text-neutral-content">Total Referrals</div>
            <div className="text-2xl font-bold text-primary">
              {referralCount}
            </div>
          </div>
          <div className="bg-base-100 p-4 rounded-xl shadow text-center">
            <div className="text-sm text-neutral-content">Bonus Rate</div>
            <div className="text-2xl font-bold text-secondary">
              {currentPercentage}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="label">
            <span className="label-text">Your Referral Link</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              value={referralLink}
              className="input input-bordered join-item w-full"
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
          <div>
            <h3 className="font-bold text-lg">
              Total Referral Bonus: ${totalBonus.toFixed(2)}
            </h3>
            <div className="text-sm mt-1">
              Earn <span className="font-semibold">{currentPercentage}%</span>{" "}
              of each referred user's initial deposit.
              <div className="mt-2">
                <span className="font-semibold">Rate Tiers:</span>
                <ul className="list-disc list-inside text-xs mt-1">
                  <li>0–4 referrals: 5%</li>
                  <li>5–9 referrals: 7%</li>
                  <li>10+ referrals: 10%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
