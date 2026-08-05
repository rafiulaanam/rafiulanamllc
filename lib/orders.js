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
