"use client";

import { useOptionalBooking } from "./booking-provider";
import { cn } from "@/lib/utils";

/**
 * Every entry point to the enquiry form is this button, and they are all
 * identical on purpose: the form opens on "General Enquiry" wherever it is
 * launched from. It used to take an `interest` prop that preselected the
 * dropdown, which meant the same button said different things depending on
 * which section it sat in.
 */
export function BookButton({
  children = "Book a consultation",
  className,
}: {
  children?: React.ReactNode;
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
      onClick={() => open()}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
