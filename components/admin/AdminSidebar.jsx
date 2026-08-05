import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-48 shrink-0 border-r border-gray-200 bg-white px-4 py-6">
      <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Admin
      </p>
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
