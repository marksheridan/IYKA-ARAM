import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/session";
import { logout } from "./actions";
import { MisSidebar, type NavItem } from "@/components/mis/sidebar";

const items: (NavItem & { roles: Role[] })[] = [
  { href: "/mis", label: "Dashboard", icon: "dashboard", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/appointments", label: "Appointments", icon: "calendar", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/yoga", label: "Yoga Sessions", icon: "yoga", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/patients", label: "Patients", icon: "patients", roles: ["ADMIN", "FRONT_DESK", "DOCTOR"] },
  { href: "/mis/doctors", label: "Doctors & Staff", icon: "doctors", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/billing", label: "Billing", icon: "billing", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/finance", label: "Finance", icon: "finance", roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/mis/messages", label: "Messages", icon: "messages", roles: ["ADMIN", "FRONT_DESK"] },
];

export default async function MisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const nav = items
    .filter((i) => i.roles.includes(user.role))
    .map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <div className="flex min-h-screen bg-[#f6f4ef]">
      <MisSidebar items={nav} user={{ name: user.name, role: user.role }} logout={logout} />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
