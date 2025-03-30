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
    if (state?.error) setError(state.error);
    if (state?.success) {
      setIsAuthenticated(true);
      router.push("/");
    }
  }, [state, router, setIsAuthenticated]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">Sign In</h2>

          <form action={formAction} className="space-y-4">
            <div className="form-control w-full">
              <label className="label justify-start p-0 mb-2">
                <span className="label-text text-base">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label justify-start p-0 mb-2">
                <span className="label-text text-base">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="********"
                className="input input-bordered w-full"
                required
              />
            </div>

            {error && (
              <div className="alert alert-error w-full">
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
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4">
              Sign In
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm">Don't have an account? </span>
            <Link href="/sign-up" className="link link-primary text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
