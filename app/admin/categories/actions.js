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

export async function createCategory(data) {
  await requireAdmin();

  try {
    await prisma.category.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        parentCategoryId: data.parentCategoryId || null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      throw new Error("A category with this name already exists");
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
}

export async function updateCategory(id, data) {
  await requireAdmin();

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: slugify(data.name),
        parentCategoryId: data.parentCategoryId || null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      throw new Error("A category with this name already exists");
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
}

export async function deleteCategory(id) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
}
