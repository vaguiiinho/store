import Link from "next/link";
import { PageHeader } from "../../../../components/page-header";
import { AdminUserForm } from "../../../../components/admin-user-form";
import { getCookieHeader, requireAdmin } from "../../../../lib/session";
import { getAdminUsers } from "../../../../lib/storefront-api";

export const metadata = { title: "Usuários" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

type PageProps = { searchParams: Promise<{ q?: string; role?: string; status?: string }> };

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const session = await requireAdmin();
  const { q = "", role = "", status = "" } = await searchParams;
  const allUsers = await getAdminUsers(await getCookieHeader());
  const term = q.trim().toLowerCase();
  const users = allUsers?.filter((user) =>
    (!term || user.name.toLowerCase().includes(term) || user.email.includes(term)) &&
    (!role || user.role === role) &&
    (!status || (status === "active" ? user.active : !user.active))
  ) ?? null;

  return (
    <>
      <PageHeader title="Usuários" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
            <h2 className="text-lg font-semibold">Contas ({users?.length ?? 0}{allUsers && users && users.length !== allUsers.length ? ` de ${allUsers.length}` : ""})</h2>
            <form method="get" className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
              <input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuários" className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm" />
              <select name="role" defaultValue={role} aria-label="Filtrar por papel" className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm">
                <option value="">Todos os papéis</option>
                <option value="USER">Usuário</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select name="status" defaultValue={status} aria-label="Filtrar por status" className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm">
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              <button className="rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-white">Filtrar</button>
            </form>
            {users ? (
              <ul className="mt-4 divide-y divide-[color:var(--border)]">
                {users.map((user) => (
                  <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}{user.id === session.id ? <span className="ml-2 text-xs font-normal text-muted">(você)</span> : null}</p>
                      <p className="truncate text-sm text-muted">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 font-semibold uppercase tracking-[0.2em] accent-text">{user.role === "ADMIN" ? "Admin" : "Usuário"}</span>
                      {!user.active ? <span className="rounded-full border border-[color:var(--danger-border)] px-3 py-1 text-[color:var(--danger)]">Inativo</span> : null}
                      <span className="text-muted">{formatDate(user.createdAt)}</span>
                    </div>
                    <Link href={`/admin/usuarios/${user.id}`} className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold transition hover:bg-white/10">Gerenciar</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p role="alert" className="mt-4 text-sm text-muted">Não foi possível carregar os usuários.</p>
            )}
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
            <h2 className="text-lg font-semibold">Novo usuário</h2>
            <div className="mt-4">
              <AdminUserForm />
            </div>
          </div>
        </div>
    </>
  );
}
