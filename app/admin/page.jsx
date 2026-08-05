import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-gray-500">
        Product, order, and customer management arrive in the Admin dashboard milestone.
      </p>
    </main>
  );
}
