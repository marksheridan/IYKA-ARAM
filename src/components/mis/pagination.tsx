import Link from "next/link";

/**
 * Server-rendered pagination bar driven by a `?page=N` query param.
 * `params` carries any other query params to preserve across page links
 * (e.g. a search term). Renders nothing when there's no data.
 */
export function Pagination({
  page,
  pageSize,
  total,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  params?: Record<string, string>;
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const href = (p: number) => {
    const sp = new URLSearchParams(params);
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `?${qs}` : "?";
  };

  const btn =
    "rounded-lg border border-sand bg-white px-3 py-1.5 text-xs text-forest transition-colors hover:border-forest";
  const btnDisabled =
    "rounded-lg border border-sand bg-sand/40 px-3 py-1.5 text-xs text-muted/50";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn}>
            ← Prev
          </Link>
        ) : (
          <span className={btnDisabled}>← Prev</span>
        )}
        <span className="text-xs">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={href(page + 1)} className={btn}>
            Next →
          </Link>
        ) : (
          <span className={btnDisabled}>Next →</span>
        )}
      </div>
    </div>
  );
}
