"use client";

import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { deleteProduct, toggleProductActive } from "@/app/admin/products/actions";

export default function ProductRowActions({ product }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductActive(product.id, !product.isActive);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(product.id);
      toast.success("Product deleted");
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href={`/admin/products/${product.id}/edit`} className="text-gray-600 hover:text-gray-900">
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        {product.isActive ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
