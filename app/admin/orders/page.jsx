import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const status = params.status;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 ${!status ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-600"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-600"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {order.user?.name || order.user?.email || order.guestEmail || "Guest"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No orders {status ? `with status ${status}` : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
