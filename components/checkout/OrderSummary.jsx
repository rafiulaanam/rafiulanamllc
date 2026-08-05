import { formatPrice } from "@/lib/currency";

export default function OrderSummary({ items, totals }) {
  return (
    <div className="rounded-lg border border-sand bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink">Order summary</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-stone">
            <span>
              {item.productVariant.product.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.productVariant.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-col gap-1 border-t border-sand pt-3 text-sm">
        <div className="flex justify-between text-stone">
          <span>Subtotal</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone">
          <span>Shipping</span>
          <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
        </div>
        <div className="flex justify-between text-stone">
          <span>Tax</span>
          <span>{formatPrice(totals.tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}
