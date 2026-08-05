import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
import ProductGrid from "@/components/storefront/ProductGrid";
import ProductFilters from "@/components/storefront/ProductFilters";
import Pagination from "@/components/storefront/Pagination";

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `Shop ${category.name} at RafiulAnamLLC.`,
    alternates: { canonical: `/products/${categorySlug}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category: categorySlug } = await params;
  const query = await searchParams;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const page = Number(query.page) || 1;
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  const sort = query.sort;

  const { products, page: currentPage, totalPages } = await getProducts({
    categorySlug,
    minPrice,
    maxPrice,
    sort,
    page,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="font-display mb-4 text-2xl text-ink">{category.name}</h1>
      <ProductFilters
        action={`/products/${categorySlug}`}
        values={{ minPrice, maxPrice, sort }}
      />
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        buildHref={(p) =>
          `/products/${categorySlug}?${new URLSearchParams({
            ...(minPrice != null ? { minPrice: String(minPrice) } : {}),
            ...(maxPrice != null ? { maxPrice: String(maxPrice) } : {}),
            ...(sort ? { sort } : {}),
            page: String(p),
          }).toString()}`
        }
      />
    </main>
  );
}
