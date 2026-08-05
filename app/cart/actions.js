"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CART_COOKIE_NAME, getCartIdentity, getCartSummary } from "@/lib/cart";

// Revalidate the cart page plus the shared shop layout, since the cart
// item count badge in the navbar is rendered there on every storefront page.
function revalidateCart() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

async function resolveOrCreateCart() {
  const identity = await getCartIdentity();

  if (identity.userId) {
    return prisma.cart.upsert({
      where: { userId: identity.userId },
      update: {},
      create: { userId: identity.userId },
    });
  }

  if (identity.sessionId) {
    const existing = await prisma.cart.findUnique({ where: { sessionId: identity.sessionId } });
    if (existing) return existing;
  }

  const sessionId = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return prisma.cart.create({ data: { sessionId } });
}

async function assertOwnsCartItem(itemId) {
  const identity = await getCartIdentity();
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) return null;
  const owns =
    (identity.userId && item.cart.userId === identity.userId) ||
    (identity.sessionId && item.cart.sessionId === identity.sessionId);

  if (!owns) throw new Error("Not authorized");
  return item;
}

// Lets client components (the cart drawer, the navbar badge) pull a fresh
// cart snapshot without a full page navigation/refresh.
export async function getCartSummaryAction() {
  return getCartSummary();
}

export async function addToCart(productVariantId, quantity = 1) {
  const variant = await prisma.productVariant.findUnique({ where: { id: productVariantId } });
  if (!variant) throw new Error("Product variant not found");

  const cart = await resolveOrCreateCart();

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productVariantId: { cartId: cart.id, productVariantId } },
  });

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stockQuantity) {
    throw new Error(`Only ${variant.stockQuantity} in stock`);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productVariantId, quantity },
    });
  }

  revalidateCart();
}

export async function updateCartItemQuantity(itemId, quantity) {
  const item = await assertOwnsCartItem(itemId);
  if (!item) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidateCart();
    return;
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: item.productVariantId } });
  if (quantity > variant.stockQuantity) {
    throw new Error(`Only ${variant.stockQuantity} in stock`);
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  revalidateCart();
}

export async function removeCartItem(itemId) {
  const item = await assertOwnsCartItem(itemId);
  if (!item) return;

  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidateCart();
}

// Called right after a successful login/registration so items added as a
// guest aren't lost once the shopper has an account.
export async function mergeGuestCartOnLogin() {
  const session = await auth();
  if (!session?.user) return;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: { cartId: userCart.id, productVariantId: item.productVariantId },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(CART_COOKIE_NAME);
  revalidateCart();
}
