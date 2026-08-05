"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";
import { updateCartItemQuantity, removeCartItem } from "@/app/cart/actions";
import { useCartDrawer } from "@/components/storefront/CartDrawerContext";

export default function CartItemRow({ item }) {
  const router = useRouter();
  const { bump } = useCartDrawer();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(item.quantity);
  const { product } = item.productVariant;
  const attributes = Object.entries(item.productVariant.attributes || {});

  const applyQuantity = (next) => {
    setQuantity(next);
    startTransition(async () => {
      try {
        await updateCartItemQuantity(item.id, next);
        bump();
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
      bump();
      router.refresh();
    });
  };

  return (
    <div className="flex gap-4 border-b border-sand py-4 last:border-0">
      <Link href={`/product/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-canvas">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="text-sm font-medium text-ink hover:text-clay">
            {product.name}
          </Link>
          {attributes.length > 0 && (
            <p className="text-xs text-stone">
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
            className="w-16 rounded-md border border-sand px-2 py-1 text-sm outline-none transition focus:border-clay"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleRemove}
            className="text-sm text-clay underline underline-offset-2 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="text-right text-sm font-semibold text-ink">
        {formatPrice(item.productVariant.price * item.quantity)}
      </div>
    </div>
  );
}
