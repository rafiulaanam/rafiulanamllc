"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, Menu, X, ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/components/storefront/CartDrawerContext";
import { getCartSummaryAction } from "@/app/cart/actions";

export default function Navbar({ categories = [], cartItemCount = 0 }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(cartItemCount);
  const { open: openCart, refreshToken } = useCartDrawer();

  useEffect(() => setCount(cartItemCount), [cartItemCount]);

  useEffect(() => {
    if (refreshToken === 0) return;
    getCartSummaryAction().then((summary) => setCount(summary.itemCount));
  }, [refreshToken]);

  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight">
          RafiulAnamLLC
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone md:flex">
          <Link href="/products" className="transition hover:text-ink">
            All products
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="transition hover:text-ink"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <form action="/search" className="hidden items-center sm:flex">
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              aria-label="Search products"
              className="w-48 rounded-l-lg border border-r-0 border-sand bg-white px-3 py-1.5 text-sm outline-none transition focus:border-clay"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-r-lg border border-sand bg-white px-2 py-1.5 text-stone transition hover:text-clay"
            >
              <Search size={16} />
            </button>
          </form>

          <button
            type="button"
            onClick={openCart}
            aria-label={count > 0 ? `Cart, ${count} item(s)` : "Cart"}
            className="relative flex items-center gap-1 text-sm text-stone transition hover:text-ink"
          >
            <ShoppingBag size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] text-white"
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link
            href={session?.user ? "/account" : "/login"}
            className="flex items-center gap-1 text-sm text-stone transition hover:text-ink"
          >
            <User size={18} />
            <span className="hidden sm:inline">{session?.user ? "Account" : "Log in"}</span>
          </Link>

          <button
            type="button"
            className="text-stone md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 overflow-hidden border-t border-sand px-6 py-4 text-sm md:hidden"
          >
            <Link href="/products" onClick={() => setOpen(false)}>
              All products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
