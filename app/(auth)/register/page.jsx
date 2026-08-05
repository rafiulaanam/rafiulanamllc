"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mergeGuestCartOnLogin } from "@/app/cart/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    await mergeGuestCartOnLogin();
    router.push("/account");
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display mb-6 text-xl text-ink">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Full name"
          aria-label="Full name"
          className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
          minLength={8}
          placeholder="Password (min 8 characters)"
          aria-label="Password (min 8 characters)"
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-stone">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-clay hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
