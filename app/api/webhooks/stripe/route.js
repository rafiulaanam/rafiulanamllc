import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";

// Orders are only ever created here, after Stripe confirms payment — never
// from the checkout page itself — so a failed payment can't create an order.
export async function POST(request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    await handlePaymentSucceeded(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent) {
  // Idempotent: Stripe can deliver the same event more than once.
  const existing = await prisma.order.findUnique({ where: { paymentIntentId: paymentIntent.id } });
  if (existing) return;

  const { cartId, userId, guestEmail, shippingAddress: shippingAddressJson } =
    paymentIntent.metadata || {};
  if (!cartId || !shippingAddressJson) return;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });
  if (!cart || cart.items.length === 0) return;

  const shippingAddress = JSON.parse(shippingAddressJson);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.productVariant.price,
    0
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: userId || null,
            guestEmail: userId ? null : guestEmail || null,
            status: "PAID",
            subtotal,
            tax: 0,
            shipping: 0,
            total: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            shippingAddress,
            billingAddress: shippingAddress,
            paymentProvider: "STRIPE",
            paymentIntentId: paymentIntent.id,
            items: {
              create: cart.items.map((item) => ({
                productVariantId: item.productVariantId,
                productNameSnapshot: item.productVariant.product.name,
                unitPrice: item.productVariant.price,
                quantity: item.quantity,
              })),
            },
          },
        });

        for (const item of cart.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        await tx.cart.delete({ where: { id: cart.id } });
      });
      return;
    } catch (error) {
      if (error.code === "P2002" && attempt < 2) continue; // order number collision, retry
      throw error;
    }
  }
}
