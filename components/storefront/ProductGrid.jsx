import ProductCard from "@/components/storefront/ProductCard";
import { StaggerGrid, StaggerItem } from "@/components/ui/motion";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="py-16 text-center text-stone">No products found.</p>;
  }

  return (
    <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
