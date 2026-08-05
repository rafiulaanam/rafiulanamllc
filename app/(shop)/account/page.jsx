import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink">Welcome, {session.user.name ?? session.user.email}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-lg border border-sand bg-white p-4 transition hover:border-clay"
        >
          <p className="font-medium text-ink">Your orders</p>
          <p className="mt-1 text-sm text-stone">Track and review past orders</p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-lg border border-sand bg-white p-4 transition hover:border-clay"
        >
          <p className="font-medium text-ink">Your addresses</p>
          <p className="mt-1 text-sm text-stone">Manage saved shipping addresses</p>
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-lg border border-sand px-4 py-2 text-sm text-ink transition hover:bg-sand"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
