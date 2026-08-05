"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addressSchema } from "@/lib/validations";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized");
  return session.user;
}

async function requireOwnedAddress(id, userId) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw new Error("Not authorized");
  return address;
}

export async function createAddress(input) {
  const user = await requireUser();
  const data = addressSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    const existingCount = await tx.address.count({ where: { userId: user.id } });
    const isDefault = Boolean(data.isDefault) || existingCount === 0;

    if (isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        phone: data.phone,
        isDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
}

export async function updateAddress(id, input) {
  const user = await requireUser();
  await requireOwnedAddress(id, user.id);
  const data = addressSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    await tx.address.update({
      where: { id },
      data: {
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        phone: data.phone,
        isDefault: Boolean(data.isDefault),
      },
    });
  });

  revalidatePath("/account/addresses");
}

export async function deleteAddress(id) {
  const user = await requireUser();
  await requireOwnedAddress(id, user.id);

  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id) {
  const user = await requireUser();
  await requireOwnedAddress(id, user.id);

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
}
