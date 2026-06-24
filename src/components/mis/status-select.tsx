"use client";

import { useTransition } from "react";
import { setAppointmentStatus } from "@/app/mis/actions";

const OPTIONS: [string, string][] = [
  ["REQUESTED", "Requested"],
  ["CONFIRMED", "Booked"],
  ["CHECKED_IN", "Checked-in"],
  ["IN_CONSULTATION", "In consultation"],
  ["COMPLETED", "Completed"],
  ["NO_SHOW", "No-show"],
  ["CANCELLED", "Cancelled"],
];

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("status", e.target.value);
        startTransition(() => setAppointmentStatus(fd));
      }}
      className="rounded-lg border border-sand bg-white px-2 py-1 text-xs text-ink outline-none focus:border-gold disabled:opacity-50"
      aria-label="Update status"
    >
      {OPTIONS.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
