"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isUniqueConstraintError } from "@/lib/prismaErrors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
}

async function findOrCreateCategory(name) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
}

export async function createProduct(data) {
  await requireAdmin();

  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId,
        basePrice: Number(data.basePrice),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        images: data.images,
        isActive: Boolean(data.isActive),
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            attributes: v.attributes,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity),
          })),
        },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      throw new Error("A product with this name/slug already exists");
    }
    if (isUniqueConstraintError(error, "sku")) {
      throw new Error("A variant with this SKU already exists");
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProduct(id, data) {
  await requireAdmin();

  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          description: data.description,
          categoryId: data.categoryId,
          basePrice: Number(data.basePrice),
          compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
          images: data.images,
          isActive: Boolean(data.isActive),
        },
      });

      const existingIds = (
        await tx.productVariant.findMany({ where: { productId: id }, select: { id: true } })
      ).map((v) => v.id);
      const keptIds = data.variants.filter((v) => v.id).map((v) => v.id);
      const removedIds = existingIds.filter((vid) => !keptIds.includes(vid));

      if (removedIds.length) {
        await tx.productVariant.deleteMany({ where: { id: { in: removedIds } } });
      }

      for (const variant of data.variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              attributes: variant.attributes,
              price: Number(variant.price),
              stockQuantity: Number(variant.stockQuantity),
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              attributes: variant.attributes,
              price: Number(variant.price),
              stockQuantity: Number(variant.stockQuantity),
            },
          });
        }
      }
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      throw new Error("A product with this name/slug already exists");
    }
    if (isUniqueConstraintError(error, "sku")) {
      throw new Error("A variant with this SKU already exists");
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${slug}`);
}

export async function deleteProduct(id) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductActive(id, isActive) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

// CSV columns: name,description,category,basePrice,compareAtPrice,images,sku,stockQuantity,isActive
// Each row creates one product with a single default variant; add size/color
// variants afterward via the edit page.
export async function importProductsCsv(rows) {
  await requireAdmin();

  let created = 0;
  const errors = [];

  for (const [index, row] of rows.entries()) {
    try {
      if (!row.name || !row.basePrice || !row.category) {
        throw new Error("Missing required field (name, basePrice, category)");
      }

      const category = await findOrCreateCategory(row.category.trim());
      const slug = slugify(row.name);
      const images = (row.images || "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      await prisma.product.create({
        data: {
          name: row.name.trim(),
          slug,
          description: row.description?.trim() || "",
          categoryId: category.id,
          basePrice: Number(row.basePrice),
          compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
          images,
          isActive: row.isActive == null || row.isActive === "" ? true : row.isActive === "true",
          variants: {
            create: [
              {
                sku: row.sku?.trim() || `${slug}-default`,
                attributes: {},
                price: Number(row.basePrice),
                stockQuantity: Number(row.stockQuantity) || 0,
              },
            ],
          },
        },
      });
      created += 1;
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error.message}`);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { created, errors };
}
