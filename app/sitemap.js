import prisma from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = ["", "/products", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/products/${category.slug}`,
    lastModified: category.updatedAt,
  }));

  const productRoutes = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
