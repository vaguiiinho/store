import Link from "next/link";
import type { ReactNode } from "react";
import { CartProvider } from "./cart-provider";
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
  const quickLinks = routeLinks.filter((link) => link.href !== "/");

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,235,209,0.92),transparent_44%)]" />
      <header className="page-shell pt-5 sm:pt-6">
        <div className="surface flex flex-col gap-4 rounded-[28px] px-5 py-4 shadow-[0_12px_40px_rgba(50,31,14,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] accent-text">{eyebrow}</p>
            <Link href="/" className="block text-lg font-semibold tracking-[-0.03em] text-[#1d1712]">
              Loja Ritual
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[color:rgba(124,79,36,0.18)] bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#6e4a29]">
              Demo de portfólio
            </span>
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
        </div>
      </header>

      <CartProvider>
        <main className="page-shell pb-14 pt-8 sm:pb-20 sm:pt-12">
          <section className="surface overflow-hidden rounded-[36px] fade-in-up">
            <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
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

                <aside className="surface-strong rounded-[30px] border border-[color:var(--border)] p-5 shadow-[0_12px_36px_rgba(50,31,14,0.08)] sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Fluxo da demo</p>
                  <div className="mt-4 space-y-3">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-sm font-semibold text-[#1e1713] transition hover:bg-white"
                      >
                        <span>{link.label}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Abrir</span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                    <p className="text-sm font-semibold text-[#1d1712]">Pronto para apresentar</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      <li>Vitrine pública com carrinho e checkout.</li>
                      <li>Pedido confirmado com pagamento simulado.</li>
                      <li>Base pensada para evoluir sem reescrever a navegação.</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10">{children}</div>
          </section>
        </main>
      </CartProvider>
    </div>
  );
}
