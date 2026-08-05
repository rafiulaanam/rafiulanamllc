import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/currency";

export default function ProductCard({ product }) {
  const priceRange = getPriceRange(product);
  const inStock = product.variants.some((v) => v.stockQuantity > 0);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-gray-200 p-3 transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
        {!inStock && (
          <span className="absolute left-2 top-2 rounded bg-gray-900/80 px-2 py-0.5 text-xs text-white">
            Out of stock
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <h2 className="line-clamp-1 text-sm font-medium text-gray-900">{product.name}</h2>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{priceRange}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function getPriceRange(product) {
  const prices = product.variants.length
    ? product.variants.map((v) => v.price)
    : [product.basePrice];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}
