import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
              Base administrativa da v1
            </h1>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Estrutura inicial para operar pedidos e evoluir o painel de produtos com controle de acesso depois.
            </p>
            <Link
              href="/admin/pedidos"
              className="inline-flex rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
            >
              Ver pedidos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
