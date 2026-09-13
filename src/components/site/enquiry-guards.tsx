"use client";

import { useEffect, useRef, useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/rate-limit";

/**
 * The two hidden fields every public enquiry form carries.
 *
 * - a honeypot input that people never see and bots fill in
 * - the time the form was rendered, so the server can reject instant submits
 *
 * `rendered_at` is set in an effect rather than at module scope so it reflects
 * when this visitor opened the form, not when the page was built or cached.
 */
export function EnquiryGuards() {
  const [renderedAt, setRenderedAt] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setRenderedAt(String(Date.now())), []);

  return (
    <>
      <input type="hidden" name="rendered_at" value={renderedAt} />
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>
          Company website (leave this empty)
        </label>
        <input
          ref={ref}
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
    </>
  );
}
