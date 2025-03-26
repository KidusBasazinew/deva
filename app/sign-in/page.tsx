"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createSession } from "../actions/createSession";
import { useFormState } from "react-dom";
import { useAuth } from "@/context/authContext";

import { useRouter } from "next/navigation";

const initialState = { error: "", success: false };

const SignIn = () => {
  const { setIsAuthenticated } = useAuth();

  const [state, formAction] = useFormState(createSession, initialState);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      setError(state.error);
    }

    if (state?.success) {
      setIsAuthenticated(true);
      router.push("/");
    }
  }, [state, router, setIsAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <form action={formAction}>
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
          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" className="!w-full !mt-2">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
