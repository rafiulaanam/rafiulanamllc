"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
}

export async function updateOrderStatus(orderId, status) {
  await requireAdmin();

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid order status");
  }

  // Shipping-confirmation emails go out here once the email provider
  // (Resend) is wired up — status transitions to SHIPPED land in this branch.
  await prisma.order.update({ where: { id: orderId }, data: { status } });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
}
