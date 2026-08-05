import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <main className="px-8 py-8">
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
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

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-2 text-sm font-semibold">Customer</h2>
            <p>{order.user?.name || address?.fullName}</p>
            <p className="text-gray-500">{order.user?.email || order.guestEmail}</p>
            {!order.user && (
              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                Guest checkout
              </span>
            )}
          </div>

          {address && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Shipping address</h2>
              <p>{address.fullName}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
              <p>{address.country}</p>
              <p>{address.phone}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
