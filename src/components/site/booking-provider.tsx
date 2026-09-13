"use client";

import { createContext, useContext, useState } from "react";
import { BookingModal } from "./booking-modal";

type BookingContextValue = {
  open: (interest?: string) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [interest, setInterest] = useState<string>("GENERAL");
  /* The modal stays mounted while closed, so its form state (and the result of
     the last submit) would otherwise survive into the next open — a visitor who
     enquired once would reopen onto a stale "Enquiry received" screen. Bumping
     this key remounts it fresh each time. */
  const [openCount, setOpenCount] = useState(0);

  const open = (next?: string) => {
    setInterest(next ?? "GENERAL");
    setOpenCount((n) => n + 1);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <BookingContext.Provider value={{ open, close }}>
      {children}
      <BookingModal
        key={openCount}
        open={isOpen}
        onClose={close}
        defaultInterest={interest}
      />
    </BookingContext.Provider>
  );
}
