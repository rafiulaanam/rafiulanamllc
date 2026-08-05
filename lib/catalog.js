import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

const SORT_OPTIONS = {
  newest: { createdAt: "desc" },
  "price-asc": { basePrice: "asc" },
  "price-desc": { basePrice: "desc" },
};

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getProducts({
  categorySlug,
  q,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
} = {}) {
  const where = { isActive: true };

  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    where.categoryId = category?.id ?? "__no_match__";
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (minPrice != null || maxPrice != null) {
    where.basePrice = {};
    if (minPrice != null) where.basePrice.gte = minPrice;
    if (maxPrice != null) where.basePrice.lte = maxPrice;
  }

  const currentPage = Math.max(1, page);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy: SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getProductBySlug(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
