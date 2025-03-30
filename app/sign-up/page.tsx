"use client";
import Link from "next/link";
import React, { useEffect, Suspense } from "react";
import createUser from "../actions/createUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";

const initialState = { error: "", success: false };

function SignUpForm() {
  const [state, formAction] = useFormState(createUser, initialState);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referral");
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push("/sign-in");
  }, [state, router]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">Sign Up</h2>

          <form action={formAction} className="space-y-4">
            <div className="form-control w-full">
              <label className="label justify-start p-0 mb-2">
                <span className="label-text text-base">
                  Referral Code (optional)
                </span>
              </label>
              <input
                type="text"
                name="referral-code"
                defaultValue={referralCode || ""}
                placeholder="Enter referral code"
                className="input input-bordered w-full"
                hidden
              />
            </div>

            <div className="form-control w-full">
              <label className="label justify-start p-0 mb-2">
                <span className="label-text text-base">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="input input-bordered w-full"
                required
              />
            </div>

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
                minLength={8}
              />
            </div>

            <div className="form-control w-full">
              <label className="label justify-start p-0 mb-2">
                <span className="label-text text-base">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirm-password"
                placeholder="********"
                className="input input-bordered w-full"
                required
                minLength={8}
              />
            </div>

            {state?.error && (
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
                <span>{state.error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4">
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm">Already have an account? </span>
            <Link href="/sign-in" className="link link-primary text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
