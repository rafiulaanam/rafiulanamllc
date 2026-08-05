import { Resend } from "resend";
import { formatPrice } from "@/lib/currency";

// Same pattern as lib/stripe.js — stay null until a key is configured
// rather than throwing, so pages/webhooks that import this don't crash.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "orders@rafiulanamllc.com";

function orderItemsHtml(order) {
  return order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px 4px 0;">${item.productNameSnapshot} × ${item.quantity}</td><td style="padding:4px 0;text-align:right;">${formatPrice(item.unitPrice * item.quantity)}</td></tr>`
    )
    .join("");
}

export async function sendOrderConfirmationEmail(order, toEmail) {
  if (!resend || !toEmail) return;

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Order confirmed — #${order.orderNumber}`,
    html: `
      <h1>Thanks for your order!</h1>
      <p>Order #${order.orderNumber} has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;">${orderItemsHtml(order)}</table>
      <p><strong>Total: ${formatPrice(order.total)}</strong></p>
    `,
  });
}

export async function sendShippingUpdateEmail(order, toEmail) {
  if (!resend || !toEmail) return;

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Your order has shipped — #${order.orderNumber}`,
    html: `
      <h1>Your order is on its way</h1>
      <p>Order #${order.orderNumber} has shipped.</p>
    `,
  });
}
