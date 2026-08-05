"use client";

import { useState } from "react";

// Token generation + email delivery go live once RESEND_API_KEY is configured.
export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h1 className="font-display mb-6 text-xl text-ink">Reset password</h1>
      {submitted ? (
        <p className="text-sm text-stone">
          If an account exists for that email, a reset link will be sent shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            aria-label="Email"
            className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay"
          />
          <button
            type="submit"
            className="rounded-lg bg-ink py-2 text-sm font-medium text-canvas transition hover:bg-clay"
          >
            Send reset link
          </button>
        </form>
      )}
    </div>
  );
}
