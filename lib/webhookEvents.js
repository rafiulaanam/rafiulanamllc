import prisma from "@/lib/prisma";

// Best-effort: recording a webhook event must never block or fail the
// actual webhook response, so swallow any error here.
export async function recordWebhookEvent({ eventType, stripeEventId, paymentIntentId, status, message }) {
  try {
    await prisma.webhookEvent.create({
      data: {
        eventType,
        stripeEventId: stripeEventId || null,
        paymentIntentId: paymentIntentId || null,
        status,
        message: message ? String(message).slice(0, 2000) : null,
      },
    });
  } catch (error) {
    if (error.code === "P2002") return; // duplicate delivery of the same Stripe event — expected, not an error
    console.error("[webhookEvents] failed to record event:", error);
  }
}
