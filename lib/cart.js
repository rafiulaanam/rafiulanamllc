import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const CART_COOKIE_NAME = "cartSessionId";

export async function getCartIdentity() {
  const session = await auth();
  if (session?.user) return { userId: session.user.id };

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  return sessionId ? { sessionId } : {};
}

export async function getCart() {
  const identity = await getCartIdentity();
  if (!identity.userId && !identity.sessionId) return null;

  return prisma.cart.findFirst({
    where: identity,
    include: {
      items: {
        include: { productVariant: { include: { product: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
}

export async function getCartSummary() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.productVariant.price,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { cart, items, subtotal, itemCount };
}
