import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderByPaymentIntentId } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import { FadeIn } from "@/components/ui/motion";

export const metadata = { title: "Order confirmed", robots: { index: false } };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The order is created by the Stripe webhook, which usually lands within a
// second or two of redirect — poll briefly before falling back to a
// "still processing" message rather than a hard error.
async function findOrderWithRetries(paymentIntentId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const order = await getOrderByPaymentIntentId(paymentIntentId);
    if (order) return order;
    await wait(800);
  }
  return null;
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent;

  const order = paymentIntentId ? await findOrderWithRetries(paymentIntentId) : null;

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Thanks — payment received</h1>
        <p className="mt-3 text-stone">
          We&apos;re still finalizing your order. This page will update shortly, or check your
          order confirmation email in a few minutes.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block text-sm font-medium text-clay underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <FadeIn>
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="text-moss" size={40} />
          <h1 className="font-display mt-3 text-2xl text-ink">Thanks for your order!</h1>
          <p className="mt-2 text-stone">Order #{order.orderNumber}</p>
        </div>

        <div className="mt-6 rounded-lg border border-sand bg-white p-4">
          <ul className="flex flex-col gap-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-stone">
                <span>
                  {item.productNameSnapshot} × {item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-sand pt-3 text-sm font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-clay underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      </FadeIn>
    </main>
  );
}
