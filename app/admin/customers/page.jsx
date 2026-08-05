import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true, status: true } },
    },
  });

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const paidOrders = customer.orders.filter((o) => o.status !== "PENDING");
              const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
              return (
                <tr key={customer.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{customer.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{paidOrders.length}</td>
                  <td className="px-4 py-3">{formatPrice(totalSpent)}</td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
