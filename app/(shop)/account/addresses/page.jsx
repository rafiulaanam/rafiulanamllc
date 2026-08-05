import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AddressCard from "@/components/account/AddressCard";
import AddressForm from "@/components/account/AddressForm";

export const metadata = { title: "Your addresses | RafiulAnamLLC" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/account" className="text-sm text-gray-500 hover:underline">
        ← Back to account
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Your addresses</h1>

      <div className="flex flex-col gap-4">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold">Add a new address</h2>
        <AddressForm />
      </div>
    </main>
  );
}
