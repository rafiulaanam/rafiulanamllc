import prisma from "@/lib/prisma";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryRowActions from "@/components/admin/CategoryRowActions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { parentCategory: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {category.parentCategory?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryRowActions category={category} categories={categories} />
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold">New category</h2>
          <CategoryForm categories={categories} />
        </div>
      </div>
    </main>
  );
}
