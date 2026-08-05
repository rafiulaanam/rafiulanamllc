import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";

export const metadata = { title: "Your orders" };

const STATUS_LABEL = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await getOrdersForUser(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/account" className="text-sm text-stone transition hover:text-clay">
        ← Back to account
      </Link>
      <h1 className="mb-6 mt-2 font-display text-2xl text-ink">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-stone">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-sand p-4 hover:border-clay"
            >
              <div>
                <p className="text-sm font-medium">#{order.orderNumber}</p>
                <p className="text-xs text-stone">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                <p className="text-xs text-stone">{STATUS_LABEL[order.status] ?? order.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
