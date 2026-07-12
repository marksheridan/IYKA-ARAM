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
    <div className="flex min-h-screen bg-mis-bg text-mis-text" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-mis-border bg-white">
        <div className="border-b border-mis-border-soft px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">IYKA-ARAM</p>
          <p className="mt-0.5 text-sm font-semibold text-mis-text">Admin</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-mis-text-muted transition-colors hover:bg-mis-border-soft hover:text-mis-text"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-mis-border-soft p-3">
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mis-text-muted transition-colors hover:bg-mis-border-soft hover:text-mis-text"
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
