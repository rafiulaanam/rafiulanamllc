"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";
import { addToCart } from "@/app/cart/actions";

export default function VariantSelector({ variants }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);

  const attributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((v) => Object.keys(v.attributes || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [variants]);

  const [selected, setSelected] = useState(() => {
    const initial = {};
    attributeKeys.forEach((key) => {
      const firstWithKey = variants.find((v) => v.attributes?.[key]);
      if (firstWithKey) initial[key] = firstWithKey.attributes[key];
    });
    return initial;
  });

  const activeVariant = useMemo(() => {
    return variants.find((v) =>
      attributeKeys.every((key) => v.attributes?.[key] === selected[key])
    );
  }, [variants, attributeKeys, selected]);

  const optionsFor = (key) => {
    const values = new Set();
    variants.forEach((v) => {
      if (v.attributes?.[key]) values.add(v.attributes[key]);
    });
    return Array.from(values);
  };

  const handleAddToCart = () => {
    if (!activeVariant) return;
    startTransition(async () => {
      try {
        await addToCart(activeVariant.id, quantity);
        toast.success("Added to cart");
        router.refresh();
      } catch (error) {
        toast.error(error.message ?? "Could not add to cart");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {attributeKeys.map((key) => (
        <div key={key}>
          <p className="mb-1 text-sm font-medium capitalize">{key}</p>
          <div className="flex flex-wrap gap-2">
            {optionsFor(key).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  selected[key] === value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-500"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold">
          {activeVariant ? formatPrice(activeVariant.price) : "Select options"}
        </span>
        {activeVariant && activeVariant.stockQuantity <= 0 && (
          <span className="text-sm text-red-600">Out of stock</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-gray-500">
          Qty
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={activeVariant?.stockQuantity ?? 1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="button"
        disabled={!activeVariant || activeVariant.stockQuantity <= 0 || isPending}
        onClick={handleAddToCart}
        className="rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add to cart"}
      </button>
    </div>
  );
}
