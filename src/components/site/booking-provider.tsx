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

  const open = (next?: string) => {
    setInterest(next ?? "GENERAL");
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <BookingContext.Provider value={{ open, close }}>
      {children}
      <BookingModal open={isOpen} onClose={close} defaultInterest={interest} />
    </BookingContext.Provider>
  );
}
