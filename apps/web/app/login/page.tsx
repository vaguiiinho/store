import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/login-form";
import { getSession } from "../../lib/session";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <main className="page-shell flex min-h-screen items-center px-6 py-8 sm:py-12">
      <section className="surface mx-auto w-full max-w-5xl overflow-hidden rounded-[36px]">
        <div className="grid-dots grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Loja Virtual</p>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#191310] sm:text-5xl">Entre para continuar</h1>
            <p className="text-base leading-7 text-muted sm:text-lg">
              Acesse o catálogo, monte seu carrinho, finalize pedidos e acompanhe suas compras.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Cliente</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1712]">Carrinho, checkout e seus próprios pedidos.</p>
              </li>
              <li className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#896139]">Admin</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1712]">Produtos, estoque, todos os pedidos e usuários.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-white/75 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#1d1712]">Entrar</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Use o e-mail e a senha da sua conta.</p>
            <div className="mt-5">
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
