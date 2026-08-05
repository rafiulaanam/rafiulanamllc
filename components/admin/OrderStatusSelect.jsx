"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateOrderStatus } from "@/app/admin/orders/actions";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function OrderStatusSelect({ orderId, status }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, next);
        toast.success(`Order marked ${next}`);
        router.refresh();
      } catch (error) {
        toast.error(error.message ?? "Could not update status");
        setValue(status);
      }
    });
  };

  return (
    <select
      aria-label="Order status"
      value={value}
      disabled={isPending}
      onChange={handleChange}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
