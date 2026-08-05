"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    router.push("/account");
    router.refresh();
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Full name"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
