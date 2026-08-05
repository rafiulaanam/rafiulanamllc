"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";
import { addToCart } from "@/app/cart/actions";
import { useCartDrawer } from "@/components/storefront/CartDrawerContext";

export default function VariantSelector({ variants, productName }) {
  const router = useRouter();
  const { open: openCart, bump } = useCartDrawer();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

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
        toast.success(`Added ${productName ?? "item"} to cart`);
        setJustAdded(true);
        bump();
        setTimeout(() => setJustAdded(false), 1400);
        openCart();
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
          <p className="mb-1 text-sm font-medium capitalize text-ink">{key}</p>
          <div className="flex flex-wrap gap-2">
            {optionsFor(key).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  selected[key] === value
                    ? "border-ink bg-ink text-canvas"
                    : "border-sand text-ink hover:border-clay"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold text-ink">
          {activeVariant ? formatPrice(activeVariant.price) : "Select options"}
        </span>
        {activeVariant && activeVariant.stockQuantity <= 0 && (
          <span className="text-sm text-clay">Out of stock</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-stone">
          Qty
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={activeVariant?.stockQuantity ?? 1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-md border border-sand px-2 py-1.5 text-sm outline-none transition focus:border-clay"
        />
      </div>

      <motion.button
        type="button"
        disabled={!activeVariant || activeVariant.stockQuantity <= 0 || isPending}
        onClick={handleAddToCart}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-lg bg-ink py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-clay disabled:opacity-50"
      >
        <AnimatePresence mode="wait" initial={false}>
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> Added
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {isPending ? "Adding..." : "Add to cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
