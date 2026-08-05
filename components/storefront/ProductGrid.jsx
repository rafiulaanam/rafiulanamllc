import ProductCard from "@/components/storefront/ProductCard";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="py-16 text-center text-gray-500">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
