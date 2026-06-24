"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/mis/appointments", label: "Overview", exact: true },
  { href: "/mis/appointments/list", label: "Manage", exact: false },
  { href: "/mis/appointments/blocks", label: "Doctor time-off", exact: false },
];

export function AppointmentsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b border-sand">
      <nav className="flex gap-1">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "border-forest font-medium text-forest"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/mis/appointments/new"
        className="mb-2 rounded-full bg-forest px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
      >
        + New appointment
      </Link>
    </div>
  );
}
