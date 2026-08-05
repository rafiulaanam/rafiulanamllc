import Link from "next/link";
import { getCartSummary } from "@/lib/cart";
import { formatPrice } from "@/lib/currency";
import CartItemRow from "@/components/storefront/CartItemRow";

export const metadata = { title: "Your cart | RafiulAnamLLC" };

export default async function CartPage() {
  const { items, subtotal } = await getCartSummary();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Your cart</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-block text-sm font-medium underline">
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

          <div className="h-fit rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Tax and shipping calculated at checkout.</p>
            <button
              type="button"
              disabled
              title="Checkout is coming in the next milestone"
              className="mt-4 w-full cursor-not-allowed rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white opacity-50"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
