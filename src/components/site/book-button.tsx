"use client";

import { useOptionalBooking } from "./booking-provider";
import { cn } from "@/lib/utils";

export function BookButton({
  children = "Book a consultation",
  interest,
  className,
}: {
  children?: React.ReactNode;
  interest?: string;
  className?: string;
}) {
  const booking = useOptionalBooking();

  // Pre-launch pages are redirected before a visitor can reach them, but Next
  // still prerenders them during the build. They intentionally have no
  // BookingProvider, so omit the otherwise-unreachable CTA in that pass.
  if (!booking) return null;

  const { open } = booking;
  return (
    <button
      onClick={() => open(interest)}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
