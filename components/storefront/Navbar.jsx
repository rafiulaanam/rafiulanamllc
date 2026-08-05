"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, User, Menu, X, ShoppingCart } from "lucide-react";

export default function Navbar({ categories = [], cartItemCount = 0 }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          RafiulAnamLLC
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
          <Link href="/products" className="hover:text-gray-900">
            All products
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="hover:text-gray-900"
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
              className="w-48 rounded-l-lg border border-r-0 border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-r-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-gray-500"
            >
              <Search size={16} />
            </button>
          </form>

          <Link
            href="/cart"
            className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ShoppingCart size={18} />
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>

          <Link
            href={session?.user ? "/account" : "/login"}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <User size={18} />
            <span className="hidden sm:inline">{session?.user ? "Account" : "Log in"}</span>
          </Link>

          <button
            type="button"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-2 border-t border-gray-200 px-6 py-4 text-sm md:hidden">
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
        </nav>
      )}
    </header>
  );
}
