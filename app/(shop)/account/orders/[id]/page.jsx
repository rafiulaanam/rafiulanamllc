import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrderForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";

const STATUS_LABEL = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const metadata = { title: "Order detail" };

export default async function OrderDetailPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/account/orders" className="text-sm text-stone transition hover:text-clay">
        ← Back to orders
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Order #{order.orderNumber}</h1>
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-stone">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-6 rounded-xl border border-sand p-4">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
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
        <div className="mt-3 flex flex-col gap-1 border-t border-sand pt-3 text-sm">
          <div className="flex justify-between text-stone">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-stone">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-4 rounded-xl border border-sand p-4 text-sm text-stone">
          <h2 className="mb-2 text-sm font-semibold text-ink">Shipping address</h2>
          <p>{address.fullName}</p>
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>
            {address.city}, {address.state} {address.zip}
          </p>
          <p>{address.country}</p>
        </div>
      )}
    </main>
  );
}
