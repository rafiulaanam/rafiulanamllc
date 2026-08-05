import prisma from "@/lib/prisma";

const STATUS_STYLES = {
  order_created: "bg-green-100 text-green-700",
  duplicate: "bg-gray-100 text-gray-600",
  no_order_expected: "bg-gray-100 text-gray-600",
  ignored: "bg-gray-100 text-gray-600",
  missing_metadata: "bg-amber-100 text-amber-700",
  cart_not_found: "bg-amber-100 text-amber-700",
  cart_empty: "bg-amber-100 text-amber-700",
  signature_verification_failed: "bg-red-100 text-red-700",
  error: "bg-red-100 text-red-700",
};

export default async function AdminWebhooksPage() {
  const events = await prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Webhook activity</h1>
      <p className="mt-1 text-sm text-gray-500">
        Every Stripe webhook delivery this app has received, regardless of outcome — use this to
        diagnose a payment that succeeded but didn&apos;t create an order.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Event type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment Intent</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-gray-100 last:border-0 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {event.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{event.eventType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[event.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {event.paymentIntentId ?? "—"}
                </td>
                <td className="max-w-md px-4 py-3 text-gray-600">{event.message ?? "—"}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No webhook deliveries recorded yet. If you&apos;ve placed a test order and
                  nothing shows up here at all, Stripe isn&apos;t reaching this endpoint —
                  double-check the webhook URL and that this deployment is the one it points to.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
