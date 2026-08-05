import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";

const LOW_STOCK_THRESHOLD = 5;
const SOLD_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    productCount,
    categoryCount,
    activeProductCount,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: { status: { in: SOLD_STATUSES }, createdAt: { gte: thirtyDaysAgo } },
      select: { total: true },
    }),
    prisma.productVariant.findMany({
      where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      include: { product: true },
      orderBy: { stockQuantity: "asc" },
      take: 10,
    }),
  ]);

  const totalSales30d = recentOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sales (30 days)" value={formatPrice(totalSales30d)} />
        <StatCard label="Orders (30 days)" value={recentOrders.length} />
        <StatCard label="Products / Published" value={`${productCount} / ${activeProductCount}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Low stock alerts</h2>
          {lowStockVariants.length === 0 ? (
            <p className="text-sm text-gray-400">No variants below {LOW_STOCK_THRESHOLD} units.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {lowStockVariants.map((variant) => (
                <li key={variant.id} className="flex items-center justify-between">
                  <Link
                    href={`/admin/products/${variant.productId}/edit`}
                    className="text-gray-700 hover:underline"
                  >
                    {variant.product.name} ({variant.sku})
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      variant.stockQuantity === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {variant.stockQuantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Categories</h2>
          <p className="text-2xl font-semibold">{categoryCount}</p>
          <Link href="/admin/categories" className="mt-2 inline-block text-sm text-gray-500 hover:underline">
            Manage categories
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
