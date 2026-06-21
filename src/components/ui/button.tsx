import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Minimal brand button — the first primitive of the IYKA design system. */
export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ink disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
