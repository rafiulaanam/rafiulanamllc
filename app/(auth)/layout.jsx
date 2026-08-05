import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <FadeIn className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center font-display text-xl text-ink">
          RafiulAnamLLC
        </Link>
        <div className="rounded-lg border border-sand bg-white p-8 shadow-sm">{children}</div>
      </FadeIn>
    </main>
  );
}
