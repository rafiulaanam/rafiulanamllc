import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/lib/catalog";
import ProductGrid from "@/components/storefront/ProductGrid";

export const metadata = {
  title: "Home",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <main>
      <section className="border-b border-gray-200 bg-gray-50 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Shop quality products online</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Browse our catalog and check out securely — fast shipping, easy returns.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white"
        >
          Shop all products
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="mb-4 text-lg font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-500"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured products</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </main>
  );
}
