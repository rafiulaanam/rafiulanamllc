import 'server-only';
import { prisma } from './prisma';
import { inquiryKinds } from './content';
import type { InquiryKind, Prisma } from '@/generated/prisma/client';

const kindMap = {
  'General inquiry': 'general', 'Business partnership': 'partnership', 'E-commerce': 'ecommerce',
  'ANAMIGO Fleet': 'anamigo_fleet', ANAMSOFT: 'anamsoft', ANAMCART: 'anamcart',
} satisfies Record<(typeof inquiryKinds)[number], InquiryKind>;

export function inquiryKind(value: keyof typeof kindMap) { return kindMap[value]; }

export function datedRow<T extends { createdAt: Date; updatedAt: Date }>({ createdAt, updatedAt, ...row }: T) {
  return { ...row, created_at: createdAt.toISOString(), updated_at: updatedAt.toISOString() };
}

export function inquiryRow<T extends { kind: InquiryKind; read_at: Date | null; createdAt: Date; updatedAt: Date }>({kind,read_at,...row}: T) {
  const label = inquiryKinds.find(value => kindMap[value] === kind)!;
  return { ...datedRow(row), kind:label, read_at:read_at?.toISOString() ?? null };
}

export function productRow<T extends { price: Prisma.Decimal | null; createdAt: Date; updatedAt: Date }>({price,...row}: T) {
  return { ...datedRow(row), price: price === null ? null : Number(price) };
}

export const productOrder = [{ display_order: 'asc' }, { name: 'asc' }, { id: 'asc' }] satisfies Prisma.ProductOrderByWithRelationInput[];
const productRelations = {
  product_categories: { select: { id: true, name: true, slug: true } },
  product_images: { select: { id: true, path: true, alt: true, display_order: true } },
} satisfies Prisma.ProductInclude;

export async function neonFeaturedProducts() {
  return (await prisma().product.findMany({ where: { published: true, featured: true }, include: productRelations, orderBy: productOrder, take: 9 })).map(productRow);
}

export async function neonBrowseProducts(search: string, category: string, skip: number, take: number) {
  const db = prisma();
  const where: Prisma.ProductWhereInput = {
    published: true,
    ...(search && { name: { contains: search.replace(/[\\%_]/g, '\\$&'), mode: 'insensitive' } }),
    ...(category && { product_categories: { slug: category } }),
  };
  const [products, categories, count] = await db.$transaction([
    db.product.findMany({ where, include: productRelations, orderBy: productOrder, skip, take }),
    db.productCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
    db.product.count({ where }),
  ], { isolationLevel: 'RepeatableRead' });
  return { products: products.map(productRow), categories, count };
}

export async function neonGetProduct(slug: string) {
  const result = await prisma().product.findUnique({ where: { slug, published: true }, include: productRelations });
  return result ? productRow(result) : null;
}
