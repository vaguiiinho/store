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
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Login</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
              Acesso administrativo
            </h1>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Entre com o e-mail e a senha do admin para acessar pedidos e, depois, a gestão de produtos.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-xl rounded-[28px] border border-[color:var(--border)] bg-white/80 p-6">
            <AdminLoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
