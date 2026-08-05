"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { getCart, getCartIdentity } from "@/lib/cart";
import { checkoutAddressSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Tax and shipping are 0 for MVP launch (flagged as an open PRD item);
// revisit once a tax jurisdiction / shipping rate is decided.
const TAX = 0;
const SHIPPING = 0;

export async function createCheckoutIntent(addressInput) {
  if (!stripe) throw new Error("Stripe is not configured yet");

  const ip = getClientIp(await headers());
  const { success } = rateLimit(`checkout:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!success) throw new Error("Too many checkout attempts. Please try again in a few minutes.");

  const address = checkoutAddressSchema.parse(addressInput);

  const cart = await getCart();
  const items = cart?.items ?? [];
  if (items.length === 0) {
    throw new Error("Your cart is empty");
  }

  for (const item of items) {
    if (item.quantity > item.productVariant.stockQuantity) {
      throw new Error(
        `${item.productVariant.product.name} only has ${item.productVariant.stockQuantity} in stock`
      );
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.productVariant.price, 0);
  const total = subtotal + TAX + SHIPPING;

  const identity = await getCartIdentity();

  // Keep the address snapshot free of transient form fields (email,
  // saveAddress) — those are handled separately below.
  const { email, saveAddress, ...shippingAddress } = address;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    receipt_email: email,
    metadata: {
      cartId: cart.id,
      userId: identity.userId ?? "",
      guestEmail: identity.userId ? "" : email,
      shippingAddress: JSON.stringify(shippingAddress),
    },
  });

  if (identity.userId && saveAddress) {
    const hasExistingAddress = await prisma.address.findFirst({
      where: { userId: identity.userId },
      select: { id: true },
    });
    await prisma.address.create({
      data: { userId: identity.userId, ...shippingAddress, isDefault: !hasExistingAddress },
    });
  }

  return {
    clientSecret: paymentIntent.client_secret,
    subtotal,
    tax: TAX,
    shipping: SHIPPING,
    total,
  };
}
