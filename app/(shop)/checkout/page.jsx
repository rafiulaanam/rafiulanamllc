import { redirect } from "next/navigation";
import { getCartSummary } from "@/lib/cart";
import { auth } from "@/lib/auth";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout | RafiulAnamLLC" };

export default async function CheckoutPage() {
  const [{ items, subtotal }, session] = await Promise.all([getCartSummary(), auth()]);

  if (items.length === 0) redirect("/cart");

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>
      <CheckoutForm
        items={items}
        subtotal={subtotal}
        publishableKey={process.env.STRIPE_PUBLISHABLE_KEY}
        defaultEmail={session?.user?.email ?? ""}
        defaultName={session?.user?.name ?? ""}
      />
    </main>
  );
}
