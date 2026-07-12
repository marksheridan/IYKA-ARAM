"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
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
          ? "bg-white/10 font-semibold text-gold"
          : "font-medium text-cream/65 hover:bg-white/5 hover:text-cream"
      }`}
    >
      <span
        className={`text-base leading-none transition-colors ${
          active ? "text-gold" : "text-cream/40 group-hover:text-gold"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
