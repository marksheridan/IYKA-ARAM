"use client";

import { useEffect, useRef } from "react";
import { HONEYPOT_FIELD } from "@/lib/enquiry-fields";

/**
 * The two hidden fields every public enquiry form carries.
 *
 * - a honeypot input that people never see and bots fill in
 * - the time the form was rendered, so the server can reject instant submits
 *
 * The timestamp is written straight to the input in an effect rather than held
 * in state: it must reflect when this visitor opened the form (not when the
 * page was built or served from cache), and nothing needs to re-render when it
 * changes.
 */
export function EnquiryGuards() {
  const stampRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stampRef.current) stampRef.current.value = String(Date.now());
  }, []);

  return (
    <>
      <input ref={stampRef} type="hidden" name="rendered_at" defaultValue="" />
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>
          Company website (leave this empty)
        </label>
        <input
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
