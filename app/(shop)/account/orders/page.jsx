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
      <Link href="/account" className="text-sm text-gray-500 hover:underline">
        ← Back to account
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-gray-400"
            >
              <div>
                <p className="text-sm font-medium">#{order.orderNumber}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                <p className="text-xs text-gray-500">{STATUS_LABEL[order.status] ?? order.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
