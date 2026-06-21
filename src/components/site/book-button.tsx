"use client";

import { useBooking } from "./booking-provider";
import { cn } from "@/lib/utils";

export function BookButton({
  children = "Book / Enquire",
  interest,
  className,
}: {
  children?: React.ReactNode;
  interest?: string;
  className?: string;
}) {
  const { open } = useBooking();
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
