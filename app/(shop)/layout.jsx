import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { getCategories } from "@/lib/catalog";

// Categories can change at any time via the admin panel, and this fetch
// must not run against the DB at build time — always render at request time.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
