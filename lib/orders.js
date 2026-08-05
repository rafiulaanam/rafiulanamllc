import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";

export function generateOrderNumber() {
  return `ORD-${randomUUID().split("-")[0].toUpperCase()}`;
}

export async function getOrderByPaymentIntentId(paymentIntentId) {
  return prisma.order.findUnique({
    where: { paymentIntentId },
    include: { items: true },
  });
}

export async function getOrdersForUser(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getOrderForUser(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== userId) return null;
  return order;
}
