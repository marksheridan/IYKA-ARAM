import { requireAdmin } from "@/lib/admin-session";
import { adminLogout } from "./actions";
import { AdminNavLink } from "@/components/admin/nav-link";
import { AdminIcon, type AdminIconName } from "@/components/admin/icons";

const NAV: { href: string; label: string; icon: AdminIconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/blog", label: "Blog", icon: "blog" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-mis-bg text-mis-text" style={{ fontFamily: "var(--font-dmsans), system-ui, sans-serif" }}>
      {/* Sidebar — the landing page's forest panel, carried into the tool */}
      <aside className="flex w-56 shrink-0 flex-col bg-mis-blue">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="admin-eyebrow" style={{ color: "var(--gold-light)" }}>IYKA-ARAM</p>
          <p className="admin-display mt-0.5 text-xl text-cream">Living Store</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cream/50 transition-colors hover:bg-white/5 hover:text-cream"
            >
              <AdminIcon name="signOut" className="h-4 w-4 shrink-0" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
