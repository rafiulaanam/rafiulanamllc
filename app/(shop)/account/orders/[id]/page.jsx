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
      <Link href="/account/orders" className="text-sm text-gray-500 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-gray-600">
              <span>
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Shipping address</h2>
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
