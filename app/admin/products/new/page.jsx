import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New product</h1>
      {categories.length === 0 ? (
        <p className="text-gray-500">
          Create a category first — visit{" "}
          <a href="/admin/categories" className="underline">
            Categories
          </a>
          .
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </main>
  );
}
