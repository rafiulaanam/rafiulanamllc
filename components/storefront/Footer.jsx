import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sand bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-stone sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base text-ink">RafiulAnamLLC</p>
        <p>© {new Date().getFullYear()} RafiulAnamLLC. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/about" className="transition hover:text-clay">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-clay">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
