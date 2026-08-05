"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteAddress, setDefaultAddress } from "@/app/account/addresses/actions";
import AddressForm from "@/components/account/AddressForm";

export default function AddressCard({ address }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this address?")) return;
    startTransition(async () => {
      await deleteAddress(address.id);
      toast.success("Address deleted");
      router.refresh();
    });
  };

  const handleSetDefault = () => {
    startTransition(async () => {
      await setDefaultAddress(address.id);
      router.refresh();
    });
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-sand p-4">
        <AddressForm address={address} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sand p-4">
      <div className="flex items-start justify-between">
        <div className="text-sm text-stone">
          <p className="font-medium text-ink">
            {address.fullName}
            {address.isDefault && (
              <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs text-stone">
                Default
              </span>
            )}
          </p>
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>
            {address.city}, {address.state} {address.zip}
          </p>
          <p>{address.country}</p>
          <p>{address.phone}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-3 text-sm">
        <button type="button" onClick={() => setEditing(true)} className="text-stone transition hover:text-clay">
          Edit
        </button>
        {!address.isDefault && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSetDefault}
            className="text-stone transition hover:text-clay disabled:opacity-50"
          >
            Set as default
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="text-clay hover:text-clay-dark disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
