export const metadata = {
  title: "Contact us",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Contact us</h1>
      <p className="mt-4 text-gray-600">
        Have a question about an order or a product? Reach out and we&apos;ll get back to you as
        soon as possible.
      </p>
      <a
        href="mailto:support@rafiulanamllc.com"
        className="mt-4 inline-block text-sm font-medium underline"
      >
        support@rafiulanamllc.com
      </a>
    </main>
  );
}
