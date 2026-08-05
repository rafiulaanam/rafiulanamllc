import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white">
        Back to home
      </Link>
    </main>
  );
}
