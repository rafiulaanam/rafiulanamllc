"use client";

import { useState } from "react";

export default function AddressForm({ defaultEmail, defaultName, isSubmitting, onSubmit }) {
  const [form, setForm] = useState({
    fullName: defaultName || "",
    email: defaultEmail || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Shipping address</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Full name" value={form.fullName} onChange={set("fullName")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input required placeholder="Address line 1" value={form.line1} onChange={set("line1")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Address line 2 (optional)" value={form.line2} onChange={set("line2")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input required placeholder="City" value={form.city} onChange={set("city")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="State" value={form.state} onChange={set("state")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="ZIP / postal code" value={form.zip} onChange={set("zip")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Country" value={form.country} onChange={set("country")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Phone" value={form.phone} onChange={set("phone")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Continuing..." : "Continue to payment"}
      </button>
    </form>
  );
}
