import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/lib/catalog";
import ProductGrid from "@/components/storefront/ProductGrid";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/motion";

export const metadata = {
  title: "Home",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-sand px-6 py-20 text-center sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(181,80,47,0.10), transparent), radial-gradient(45% 45% at 85% 100%, rgba(75,91,69,0.08), transparent)",
          }}
        />
        <FadeIn as="div">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-clay">RafiulAnamLLC</p>
          <h1 className="font-display text-4xl italic leading-tight text-ink sm:text-6xl">
            Considered goods,
            <br className="hidden sm:block" /> made for everyday
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-stone">
            Browse our catalog and check out securely — fast shipping, easy returns, no
            nonsense.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-lg bg-ink px-7 py-3 text-sm font-medium text-canvas transition hover:bg-clay"
          >
            Shop all products
          </Link>
        </FadeIn>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <FadeIn as="h2" className="font-display mb-5 text-xl text-ink">
            Shop by category
          </FadeIn>
          <StaggerGrid className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <Link
                  href={`/products/${category.slug}`}
                  className="inline-block rounded-full border border-sand bg-white px-4 py-2 text-sm text-ink transition hover:border-clay hover:text-clay"
                >
                  {category.name}
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Featured products</h2>
          <Link href="/products" className="text-sm text-stone transition hover:text-clay">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </main>
  );
}
