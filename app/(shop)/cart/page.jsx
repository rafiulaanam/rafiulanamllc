import Link from "next/link";
import { getCartSummary } from "@/lib/cart";
import { formatPrice } from "@/lib/currency";
import CartItemRow from "@/components/storefront/CartItemRow";

export const metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const { items, subtotal } = await getCartSummary();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl text-ink">Your cart</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-stone">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-clay underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="h-fit rounded-lg border border-sand bg-white p-4">
            <div className="flex items-center justify-between text-sm text-stone">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone">Free shipping. No tax at this time.</p>
            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-lg bg-ink py-2.5 text-center text-sm font-medium text-canvas transition hover:bg-clay"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
