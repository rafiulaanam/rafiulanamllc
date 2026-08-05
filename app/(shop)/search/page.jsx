import { getProducts } from "@/lib/catalog";
import ProductGrid from "@/components/storefront/ProductGrid";
import Pagination from "@/components/storefront/Pagination";

export const metadata = {
  title: "Search | RafiulAnamLLC",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Number(params.page) || 1;

  const { products, page: currentPage, totalPages } = q
    ? await getProducts({ q, page })
    : { products: [], page: 1, totalPages: 1 };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold">
        {q ? `Search results for "${q}"` : "Search"}
      </h1>
      {q ? (
        <>
          <ProductGrid products={products} />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            buildHref={(p) => `/search?${new URLSearchParams({ q, page: String(p) }).toString()}`}
          />
        </>
      ) : (
        <p className="text-gray-500">Enter a search term to find products.</p>
      )}
    </main>
  );
}
