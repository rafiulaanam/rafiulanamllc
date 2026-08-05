"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendShippingUpdateEmail } from "@/lib/email";

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

  const previous = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!previous) throw new Error("Order not found");

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });

  if (status === "SHIPPED" && previous.status !== "SHIPPED") {
    const toEmail = previous.user?.email || previous.guestEmail;
    try {
      await sendShippingUpdateEmail(updated, toEmail);
    } catch (emailError) {
      console.error("[admin] shipping update email failed:", emailError);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
}
