const symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

export function formatPrice(amount) {
  return `${symbol}${Number(amount).toFixed(2)}`;
}
