import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "../../../components/admin-login-form";
import { getAdminAuthMe } from "../../../lib/storefront-api";

export default async function AdminLoginPage() {
  const cookieHeader = cookies().toString();
  const session = await getAdminAuthMe(cookieHeader);

  if (session?.authenticated) {
    redirect("/admin");
  }

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Login</p>
              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#191310] sm:text-5xl">
                Acesso administrativo
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Entre com o e-mail e a senha do admin para acessar pedidos e a gestão de produtos.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Segurança</p>
                  <p className="mt-2 text-sm leading-6 text-[#1d1712]">Cookie httpOnly para autenticação do painel.</p>
                </div>
                <div className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Operação</p>
                  <p className="mt-2 text-sm leading-6 text-[#1d1712]">Status de pedidos e produtos em um só lugar.</p>
                </div>
                <div className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Portfólio</p>
                  <p className="mt-2 text-sm leading-6 text-[#1d1712]">Painel suficiente para demonstrar controle e fluxo.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/75 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Entrar agora</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Use as credenciais do admin para abrir o painel de operação.
              </p>
              <div className="mt-5">
                <AdminLoginForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
