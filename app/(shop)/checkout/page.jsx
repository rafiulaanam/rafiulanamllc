import { redirect } from "next/navigation";
import { getCartSummary } from "@/lib/cart";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [{ items, subtotal }, session] = await Promise.all([getCartSummary(), auth()]);

  if (items.length === 0) redirect("/cart");

  const defaultAddress = session?.user
    ? await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl text-ink">Checkout</h1>
      <CheckoutForm
        items={items}
        subtotal={subtotal}
        publishableKey={process.env.STRIPE_PUBLISHABLE_KEY}
        defaultEmail={session?.user?.email ?? ""}
        defaultName={session?.user?.name ?? defaultAddress?.fullName ?? ""}
        defaultAddress={defaultAddress}
        isLoggedIn={Boolean(session?.user)}
      />
    </main>
  );
}
