import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuthMe } from "../../lib/storefront-api";

export default async function AdminHomePage() {
  const cookieHeader = (await cookies()).toString();
  const session = await getAdminAuthMe(cookieHeader);

  if (!session?.authenticated) {
    redirect("/admin/login");
  }

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin</p>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#191310] sm:text-5xl">
                  Gestão da loja
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                  Uma visão enxuta para operar pedidos, produto e status sem perder o acabamento da vitrine pública.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/pedidos"
                  className="inline-flex rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] shadow-[0_10px_24px_rgba(29,23,18,0.16)] transition hover:bg-[#34261d]"
                >
                  Ver pedidos
                </Link>
                <Link
                  href="/admin/produtos"
                  className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/70 px-5 py-3 text-sm font-semibold text-[#392a1e] transition hover:bg-white"
                >
                  Ver produtos
                </Link>
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Ver vitrine
                </Link>
              </div>

              <p className="text-sm text-muted">Sessão ativa em {session.email}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Pedidos</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">Operação</p>
                <p className="mt-2 text-sm leading-6 text-muted">Acompanhe o status e a confirmação do checkout visitante.</p>
              </div>
              <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Produtos</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">Catálogo</p>
                <p className="mt-2 text-sm leading-6 text-muted">Ative, edite e mantenha a vitrine pronta para apresentação.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
