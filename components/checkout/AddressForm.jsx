"use client";

import { useState } from "react";

export default function AddressForm({
  defaultEmail,
  defaultName,
  defaultAddress,
  isLoggedIn,
  isSubmitting,
  onSubmit,
}) {
  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName || defaultName || "",
    email: defaultEmail || "",
    line1: defaultAddress?.line1 || "",
    line2: defaultAddress?.line2 || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    zip: defaultAddress?.zip || "",
    country: defaultAddress?.country || "",
    phone: defaultAddress?.phone || "",
    saveAddress: false,
  });

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-ink">Shipping address</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Full name" aria-label="Full name" value={form.fullName} onChange={set("fullName")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay sm:col-span-2" />
        <input required type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={set("email")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay sm:col-span-2" />
        <input required placeholder="Address line 1" aria-label="Address line 1" value={form.line1} onChange={set("line1")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay sm:col-span-2" />
        <input placeholder="Address line 2 (optional)" aria-label="Address line 2 (optional)" value={form.line2} onChange={set("line2")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay sm:col-span-2" />
        <input required placeholder="City" aria-label="City" value={form.city} onChange={set("city")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay" />
        <input required placeholder="State" aria-label="State" value={form.state} onChange={set("state")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay" />
        <input required placeholder="ZIP / postal code" aria-label="ZIP / postal code" value={form.zip} onChange={set("zip")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay" />
        <input required placeholder="Country" aria-label="Country" value={form.country} onChange={set("country")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay" />
        <input required placeholder="Phone" aria-label="Phone" value={form.phone} onChange={set("phone")} className="rounded-md border border-sand px-3 py-2 text-sm outline-none transition focus:border-clay sm:col-span-2" />
      </div>

      {isLoggedIn && (
        <label className="flex items-center gap-2 text-sm text-stone">
          <input type="checkbox" checked={form.saveAddress} onChange={set("saveAddress")} />
          Save this address to my account
        </label>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-canvas transition hover:bg-clay disabled:opacity-50"
      >
        {isSubmitting ? "Continuing..." : "Continue to payment"}
      </button>
    </form>
  );
}
