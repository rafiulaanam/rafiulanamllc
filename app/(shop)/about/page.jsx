export const metadata = {
  title: "About us",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-2xl text-ink">About RafiulAnamLLC</h1>
      <p className="mt-4 text-stone">
        RafiulAnamLLC is an online retail store offering quality products across a range of
        categories, with fast shipping and a straightforward checkout experience.
      </p>
      <p className="mt-4 text-stone">
        We&apos;re just getting started — more about our story will go here soon.
      </p>
    </main>
  );
}
