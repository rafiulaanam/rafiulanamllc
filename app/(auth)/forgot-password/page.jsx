"use client";

import { useState } from "react";

// Token generation + email delivery is wired up once the email provider
// (Milestone: Checkout & Payments / Accounts) is in place.
export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Reset password</h1>
      {submitted ? (
        <p className="text-sm text-gray-600">
          If an account exists for that email, a reset link will be sent shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 py-2 text-sm font-medium text-white"
          >
            Send reset link
          </button>
        </form>
      )}
    </div>
  );
}
