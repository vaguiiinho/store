import Link from "next/link";
import type { ReactNode } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

type StatCardProps = { label: string; value: ReactNode; href?: string; hint?: ReactNode };

export function StatCard({ label, value, href, hint }: StatCardProps) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );
  const base = "surface block rounded-[24px] p-5";
  return href ? (
    <Link href={href} className={`${base} transition hover:border-[color:rgba(124,79,36,0.34)] ${focusRing}`}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

export function StatError({ label }: { label: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
      Não foi possível carregar {label}.
    </div>
  );
}
