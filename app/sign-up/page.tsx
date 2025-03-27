"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import createUser from "../actions/createUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";

const initialState = { error: "", success: false };

const SignUp = () => {
  const [state, formAction] = useFormState(createUser, initialState);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referral");
  const router = useRouter();

  useEffect(() => {
    if (state?.error) console.log(state.error);
    if (state?.success) {
      console.log("You can now log in!");
      router.push("/sign-in");
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <form action={formAction}>
          <div className="mb-4">
            <label
              htmlFor="referral-code"
              className="block text-sm font-medium text-gray-700"
            >
              Referral Code (optional)
            </label>
            <input
              type="text"
              id="referral-code"
              name="referral-code"
              defaultValue={referralCode || ""}
              className="mt-1 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter referral code"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="********"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="password"
              name="confirm-password"
              className="mt-1 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="********"
            />
          </div>
          <button type="submit" className="!w-full">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
