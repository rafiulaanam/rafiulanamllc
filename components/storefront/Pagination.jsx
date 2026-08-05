import Link from "next/link";

export default function Pagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-sm">
      <PageLink page={page - 1} disabled={page <= 1} buildHref={buildHref}>
        Prev
      </PageLink>
      <span className="px-2 text-stone">
        Page {page} of {totalPages}
      </span>
      <PageLink page={page + 1} disabled={page >= totalPages} buildHref={buildHref}>
        Next
      </PageLink>
    </div>
  );
}

function PageLink({ page, disabled, buildHref, children }) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-sand px-3 py-1.5 text-stone/50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={buildHref(page)}
      className="rounded-lg border border-sand px-3 py-1.5 text-ink transition hover:border-clay hover:text-clay"
    >
      {children}
    </Link>
  );
}
