import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { recordWebhookEvent } from "@/lib/webhookEvents";

// Orders are only ever created here, after Stripe confirms payment — never
// from the checkout page itself — so a failed payment can't create an order.
//
// Every delivery is durably recorded via recordWebhookEvent (visible at
// /admin/webhooks) regardless of outcome — platform function logs alone
// aren't reliable enough for diagnosing "payment succeeded but no order
// appeared" reports after the fact.
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
    await recordWebhookEvent({
      eventType: "unknown",
      status: "signature_verification_failed",
      message: error.message,
    });
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  const paymentIntentId = event.data?.object?.id ?? null;
  let status = "ignored";
  let message = null;

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const result = await handlePaymentSucceeded(event.data.object);
        status = result.status;
        message = result.message;
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        status = "no_order_expected";
        break;
      default:
        // Other payment_intent.* events (processing, requires_action, etc.)
        // are expected since the endpoint is subscribed to all of them, but
        // only "succeeded" results in an order.
        status = "ignored";
        break;
    }
  } catch (error) {
    await recordWebhookEvent({
      eventType: event.type,
      stripeEventId: event.id,
      paymentIntentId,
      status: "error",
      message: error.message,
    });
    throw error; // surface as 500 so Stripe retries delivery
  }

  await recordWebhookEvent({
    eventType: event.type,
    stripeEventId: event.id,
    paymentIntentId,
    status,
    message,
  });

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent) {
  // Idempotent: Stripe can deliver the same event more than once.
  const existing = await prisma.order.findUnique({ where: { paymentIntentId: paymentIntent.id } });
  if (existing) {
    return { status: "duplicate", message: `Order ${existing.id} already exists` };
  }

  const { cartId, userId, guestEmail, shippingAddress: shippingAddressJson } =
    paymentIntent.metadata || {};
  if (!cartId || !shippingAddressJson) {
    return {
      status: "missing_metadata",
      message: `metadata keys present: ${Object.keys(paymentIntent.metadata || {}).join(", ") || "(none)"}`,
    };
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });
  if (!cart) {
    return { status: "cart_not_found", message: `cartId ${cartId} does not exist` };
  }
  if (cart.items.length === 0) {
    return { status: "cart_empty", message: `cart ${cartId} has no items` };
  }

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

      return { status: "order_created", message: `Order ${order.id} (${order.orderNumber})` };
    } catch (error) {
      if (error.code === "P2002" && attempt < 2) continue; // order number collision, retry
      throw error;
    }
  }
}
