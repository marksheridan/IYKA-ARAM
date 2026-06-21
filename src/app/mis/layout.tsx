import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/session";
import { logout } from "./actions";

const items: { href: string; label: string; roles: Role[] }[] = [
  { href: "/mis", label: "Dashboard", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/appointments", label: "Appointments", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/yoga", label: "Yoga Sessions", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/patients", label: "Patients", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/doctors", label: "Doctors & Staff", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/billing", label: "Billing", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/finance", label: "Finance", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/messages", label: "Messages", roles: ["ADMIN", "FRONT_DESK"] },
];

export default async function MisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const nav = items.filter((i) => i.roles.includes(user.role));

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sand bg-sand/40 px-4 py-6">
        <div className="px-2 font-display text-lg text-forest">IYKA MIS</div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 text-sm">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-lg px-3 py-2 text-muted transition-colors hover:bg-cream hover:text-ink"
            >
              {i.label}
            </Link>
          ))}
          <p className="mt-4 px-3 text-xs text-muted/60">
            Richer dashboard analytics &amp; WhatsApp messaging — coming next.
          </p>
        </nav>

        <div className="mt-auto border-t border-sand pt-4">
          <div className="px-2 text-sm font-medium text-ink">{user.name}</div>
          <div className="px-2 text-xs capitalize text-muted">
            {user.role.replace(/_/g, " ").toLowerCase()}
          </div>
          <form action={logout} className="mt-3 px-2">
            <button className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-cream px-8 py-8">{children}</main>
    </div>
  );
}
