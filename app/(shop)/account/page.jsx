import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>
      <p className="mt-2 text-gray-500">
        Order history and address book are coming in the Accounts milestone.
      </p>
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
