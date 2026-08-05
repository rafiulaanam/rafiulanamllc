"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";
import { useCartDrawer } from "@/components/storefront/CartDrawerContext";
import {
  getCartSummaryAction,
  updateCartItemQuantity,
  removeCartItem,
} from "@/app/cart/actions";

export default function CartDrawer() {
  const { isOpen, close, refreshToken, bump } = useCartDrawer();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getCartSummaryAction()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [isOpen, refreshToken]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const handleQuantityChange = (itemId, quantity) => {
    startTransition(async () => {
      try {
        await updateCartItemQuantity(itemId, quantity);
        bump();
      } catch (error) {
        toast.error(error.message ?? "Could not update quantity");
      }
    });
  };

  const handleRemove = (itemId) => {
    startTransition(async () => {
      await removeCartItem(itemId);
      bump();
    });
  };

  const items = summary?.items ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-canvas shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex items-center justify-between border-b border-sand px-5 py-4">
              <h2 className="font-display text-lg">Your cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-stone hover:bg-sand"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading && !summary ? (
                <p className="text-sm text-stone">Loading...</p>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-stone">Your cart is empty.</p>
                  <Link
                    href="/products"
                    onClick={close}
                    className="text-sm font-medium text-clay underline underline-offset-4"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-sand">
                        {item.productVariant.product.images[0] && (
                          <Image
                            src={item.productVariant.product.images[0]}
                            alt={item.productVariant.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {item.productVariant.product.name}
                          </p>
                          <p className="whitespace-nowrap text-sm font-medium">
                            {formatPrice(item.productVariant.price * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="rounded-full border border-sand p-1 text-stone hover:border-clay hover:text-clay disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="rounded-full border border-sand p-1 text-stone hover:border-clay hover:text-clay disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemove(item.id)}
                            className="ml-auto text-xs text-stone underline underline-offset-2 hover:text-clay disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-sand px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="block w-full rounded-lg bg-clay py-2.5 text-center text-sm font-medium text-white transition hover:bg-clay-dark"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={close}
                  className="mt-2 block w-full py-1 text-center text-xs text-stone underline underline-offset-2 hover:text-clay"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
