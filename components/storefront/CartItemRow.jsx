"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";
import { updateCartItemQuantity, removeCartItem } from "@/app/cart/actions";

export default function CartItemRow({ item }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(item.quantity);
  const { product } = item.productVariant;
  const attributes = Object.entries(item.productVariant.attributes || {});

  const applyQuantity = (next) => {
    setQuantity(next);
    startTransition(async () => {
      try {
        await updateCartItemQuantity(item.id, next);
        router.refresh();
      } catch (error) {
        toast.error(error.message ?? "Could not update quantity");
        setQuantity(item.quantity);
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeCartItem(item.id);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-4 border-b border-gray-100 py-4 last:border-0">
      <Link href={`/product/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="text-sm font-medium hover:underline">
            {product.name}
          </Link>
          {attributes.length > 0 && (
            <p className="text-xs text-gray-500">
              {attributes.map(([k, v]) => `${k}: ${v}`).join(", ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={item.productVariant.stockQuantity}
            value={quantity}
            disabled={isPending}
            onChange={(e) => applyQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="text-right text-sm font-semibold">
        {formatPrice(item.productVariant.price * item.quantity)}
      </div>
    </div>
  );
}
