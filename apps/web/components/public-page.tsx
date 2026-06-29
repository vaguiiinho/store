import Link from "next/link";
import type { ReactNode } from "react";
import { routeLinks } from "../lib/storefront-content";

type PublicPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
};

export function PublicPage({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children
}: PublicPageProps) {
  return (
    <div className="min-h-screen">
      <header className="page-shell pt-5 sm:pt-6">
        <div className="surface flex flex-col gap-4 rounded-[28px] px-5 py-4 shadow-[0_12px_40px_rgba(50,31,14,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] accent-text">{eyebrow}</p>
            <Link href="/" className="block text-lg font-semibold tracking-[-0.03em] text-[#1d1712]">
              Loja Ritual
            </Link>
          </div>

          <nav aria-label="Navegação principal" className="flex flex-wrap gap-2">
            {routeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[color:var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[#33271d] transition hover:border-[color:rgba(124,79,36,0.34)] hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="page-shell pb-14 pt-8 sm:pb-20 sm:pt-12">
        <section className="surface overflow-hidden rounded-[36px]">
          <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
            <div className="max-w-3xl space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">{eyebrow}</p>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base text-muted sm:text-lg">{description}</p>
              </div>

              {(primaryAction || secondaryAction) && (
                <div className="flex flex-wrap gap-3">
                  {primaryAction ? (
                    <Link
                      href={primaryAction.href}
                      className="rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
                    >
                      {primaryAction.label}
                    </Link>
                  ) : null}
                  {secondaryAction ? (
                    <Link
                      href={secondaryAction.href}
                      className="rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/70 px-5 py-3 text-sm font-semibold text-[#392a1e] transition hover:bg-white"
                    >
                      {secondaryAction.label}
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">{children}</div>
        </section>
      </main>
    </div>
  );
}
