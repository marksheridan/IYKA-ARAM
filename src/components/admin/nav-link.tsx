"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon, type AdminIconName } from "./icons";

export function AdminNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: AdminIconName;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-white/10 font-semibold text-gold-light"
          : "font-medium text-cream/65 hover:bg-white/5 hover:text-cream"
      }`}
    >
      <AdminIcon
        name={icon}
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? "text-gold-light" : "text-cream/40 group-hover:text-gold-light"
        }`}
      />
      {label}
    </Link>
  );
}
