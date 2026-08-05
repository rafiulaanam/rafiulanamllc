import { getProducts } from "@/lib/catalog";
import ProductGrid from "@/components/storefront/ProductGrid";
import ProductFilters from "@/components/storefront/ProductFilters";
import Pagination from "@/components/storefront/Pagination";

export const metadata = {
  title: "All products | RafiulAnamLLC",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort;

  const { products, page: currentPage, totalPages } = await getProducts({
    minPrice,
    maxPrice,
    sort,
    page,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold">All products</h1>
      <ProductFilters action="/products" values={{ minPrice, maxPrice, sort }} />
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        buildHref={(p) =>
          `/products?${new URLSearchParams({
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
