import { PageHeader } from "../../../components/page-header";
import { ChangePasswordForm } from "../../../components/change-password-form";
import { requireSession } from "../../../lib/session";

export const metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const user = await requireSession();

  return (
    <>
      <PageHeader title="Minha conta" />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
          <h2 className="text-lg font-semibold">Conta</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-muted">Nome</dt><dd className="font-semibold">{user.name}</dd></div>
            <div><dt className="text-muted">E-mail</dt><dd className="font-semibold">{user.email}</dd></div>
            <div><dt className="text-muted">Papel</dt><dd className="font-semibold">{user.role === "ADMIN" ? "Admin" : "Usuário"}</dd></div>
          </dl>
        </div>
        <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
          <h2 className="text-lg font-semibold">Trocar senha</h2>
          {user.primaryAdmin ? (
            <p className="mt-4 text-sm leading-6 text-muted">A senha do admin principal é definida em <code>ADMIN_PASSWORD</code> no ambiente (GitHub Secrets em produção) e é aplicada quando a API sobe.</p>
          ) : (
            <div className="mt-4"><ChangePasswordForm /></div>
          )}
        </div>
      </div>
    </>
  );
}
