import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, activeProductCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-gray-500">
        Order and sales metrics arrive in the Admin dashboard milestone.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={productCount} />
        <StatCard label="Published" value={activeProductCount} />
        <StatCard label="Categories" value={categoryCount} />
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
