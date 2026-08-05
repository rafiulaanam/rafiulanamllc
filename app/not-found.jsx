import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-3xl text-ink">Page not found</h1>
      <p className="text-stone">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-2 rounded-lg bg-ink px-5 py-2 text-sm font-medium text-canvas transition hover:bg-clay">
        Back to home
      </Link>
    </main>
  );
}
