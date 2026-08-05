"use server";

import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { getCart, getCartIdentity } from "@/lib/cart";
import { checkoutAddressSchema } from "@/lib/validations";

// Tax and shipping are 0 for MVP launch (flagged as an open PRD item);
// revisit once a tax jurisdiction / shipping rate is decided.
const TAX = 0;
const SHIPPING = 0;

export async function createCheckoutIntent(addressInput) {
  if (!stripe) throw new Error("Stripe is not configured yet");

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    receipt_email: address.email,
    metadata: {
      cartId: cart.id,
      userId: identity.userId ?? "",
      guestEmail: identity.userId ? "" : address.email,
      shippingAddress: JSON.stringify(address),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    subtotal,
    tax: TAX,
    shipping: SHIPPING,
    total,
  };
}
