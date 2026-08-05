import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { getCategories } from "@/lib/catalog";
import { getCartSummary } from "@/lib/cart";

// Categories and cart contents can change at any time — this fetch must
// not run against the DB at build time, always render at request time.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }) {
  const [categories, { itemCount }] = await Promise.all([getCategories(), getCartSummary()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} cartItemCount={itemCount} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
