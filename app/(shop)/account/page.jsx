import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-xl border border-gray-200 p-4 hover:border-gray-400"
        >
          <p className="font-medium">Your orders</p>
          <p className="mt-1 text-sm text-gray-500">Track and review past orders</p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-xl border border-gray-200 p-4 hover:border-gray-400"
        >
          <p className="font-medium">Your addresses</p>
          <p className="mt-1 text-sm text-gray-500">Manage saved shipping addresses</p>
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
          Log out
        </button>
      </form>
    </main>
  );
}
