import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { adminLogout } from "./actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Products", icon: "⬡" },
  { href: "/admin/orders", label: "Orders", icon: "◫" },
  { href: "/admin/customers", label: "Customers", icon: "◎" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">IYKA-ARAM</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-800">Admin</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3">
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            >
              <span>↩</span> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
