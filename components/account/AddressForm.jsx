"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createAddress, updateAddress } from "@/app/account/addresses/actions";

export default function AddressForm({ address, onDone }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: address?.fullName ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    zip: address?.zip ?? "",
    country: address?.country ?? "",
    phone: address?.phone ?? "",
    isDefault: address?.isDefault ?? false,
  });

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (address) {
          await updateAddress(address.id, form);
          toast.success("Address updated");
        } else {
          await createAddress(form);
          toast.success("Address added");
          setForm({
            fullName: "",
            line1: "",
            line2: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            phone: "",
            isDefault: false,
          });
        }
        router.refresh();
        onDone?.();
      } catch (error) {
        toast.error(error.message ?? "Could not save address");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Full name" value={form.fullName} onChange={set("fullName")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input required placeholder="Address line 1" value={form.line1} onChange={set("line1")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Address line 2 (optional)" value={form.line2} onChange={set("line2")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <input required placeholder="City" value={form.city} onChange={set("city")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="State" value={form.state} onChange={set("state")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="ZIP / postal code" value={form.zip} onChange={set("zip")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Country" value={form.country} onChange={set("country")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Phone" value={form.phone} onChange={set("phone")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} />
        Set as default address
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : address ? "Save changes" : "Add address"}
      </button>
    </form>
  );
}
