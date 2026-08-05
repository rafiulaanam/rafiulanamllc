"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/currency";

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const priceRange = getPriceRange(product);
  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  const [primaryImage, secondaryImage] = product.images;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-sand bg-white p-3 transition-shadow duration-200 hover:shadow-lg hover:shadow-ink/5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-canvas">
        {primaryImage ? (
          <>
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
            {secondaryImage && (
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Image
                  src={secondaryImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone">
            No image
          </div>
        )}
        {!inStock && (
          <span className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-canvas">
            Out of stock
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-stone">{product.category?.name}</p>
        <h2 className="line-clamp-1 text-sm font-medium text-ink">{product.name}</h2>
        <motion.div
          className="mt-1 flex items-center gap-2"
          animate={{ y: hovered ? -2 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <span className="text-sm font-semibold text-ink">{priceRange}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </motion.div>
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
