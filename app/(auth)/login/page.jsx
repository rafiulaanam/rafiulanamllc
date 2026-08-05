"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mergeGuestCartOnLogin } from "@/app/cart/actions";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    await mergeGuestCartOnLogin();
    router.push("/account");
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display mb-6 text-xl text-ink">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          aria-label="Email"
          className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          placeholder="Password"
          aria-label="Password"
          className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink py-2 text-sm font-medium text-canvas transition hover:bg-clay disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-stone">
        <Link href="/forgot-password" className="hover:text-clay">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-clay">
          Create account
        </Link>
      </div>
    </div>
  );
}
