import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object);
      break;
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      // No order to create — the checkout page never created one either.
      console.warn(`[stripe webhook] ${event.type}: ${event.data.object.id}`);
      break;
    default:
      // Other payment_intent.* events (processing, requires_action, etc.) are
      // expected since the endpoint is subscribed to all of them, but only
      // "succeeded" results in an order.
      break;
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
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
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
          include: { items: true },
        });

        for (const item of cart.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        await tx.cart.delete({ where: { id: cart.id } });

        return created;
      });

      try {
        await sendOrderConfirmationEmail(order, paymentIntent.receipt_email);
      } catch (emailError) {
        // The order is already committed — don't fail the webhook (and
        // trigger a Stripe retry) over a transactional email hiccup.
        console.error("[stripe webhook] order confirmation email failed:", emailError);
      }
      return;
    } catch (error) {
      if (error.code === "P2002" && attempt < 2) continue; // order number collision, retry
      throw error;
    }
  }
}
