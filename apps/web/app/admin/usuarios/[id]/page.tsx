import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserActions } from "../../../../components/admin-user-actions";
import { AdminUserDelete } from "../../../../components/admin-user-delete";
import { AdminUserEditForm } from "../../../../components/admin-user-edit-form";
import { formatCurrencyBRL } from "../../../../lib/format";
import { getCookieHeader, requireAdmin } from "../../../../lib/session";
import { getAdminUser, getAdminUserOrders } from "../../../../lib/storefront-api";

export const metadata = { title: "Usuário" };

type PageProps = { params: Promise<{ id: string }> };

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default async function AdminUsuarioPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireAdmin();
  const cookie = await getCookieHeader();
  const [user, orders] = await Promise.all([getAdminUser(id, cookie), getAdminUserOrders(id, cookie)]);

  if (!user) notFound();

  const isSelf = user.id === session.id;
  const canDelete = !isSelf && !user.primaryAdmin;

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Usuários / Detalhe</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 font-semibold uppercase tracking-[0.2em] accent-text">{user.role === "ADMIN" ? "Admin" : "Usuário"}</span>
              <span className={user.active ? "rounded-full border border-[color:var(--border)] px-3 py-1" : "rounded-full border border-[color:var(--danger-border)] px-3 py-1 text-[color:var(--danger)]"}>{user.active ? "Ativo" : "Inativo"}</span>
              {user.primaryAdmin ? <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-muted">Admin principal</span> : null}
              {isSelf ? <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-muted">Você</span> : null}
            </div>
            <p className="text-sm text-muted">{user.email} · criado em {dateFormat.format(new Date(user.createdAt))}</p>
            <Link href="/admin/usuarios" className="inline-flex rounded-full border border-[color:var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold text-[#392a1e] transition hover:bg-white">Voltar aos usuários</Link>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-2">
          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
            <h2 className="text-lg font-semibold">Dados</h2>
            <div className="mt-4"><AdminUserEditForm user={user} isSelf={isSelf} /></div>
          </div>

          <div className="space-y-6">
            <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5">
              <h2 className="text-lg font-semibold">Acesso</h2>
              <p className="mt-1 text-sm text-muted">Ativar/desativar e redefinir a senha.</p>
              <div className="mt-4 flex justify-start"><AdminUserActions user={user} isSelf={isSelf} /></div>
            </div>

            {canDelete ? (
              <div className="surface-strong rounded-[28px] border border-[color:var(--danger-border)] p-5">
                <h2 className="text-lg font-semibold text-[color:var(--danger)]">Excluir conta</h2>
                <div className="mt-3"><AdminUserDelete user={user} /></div>
              </div>
            ) : null}
          </div>

          <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold">Pedidos ({orders?.length ?? 0})</h2>
            {orders === null ? (
              <p role="alert" className="mt-4 text-sm text-muted">Não foi possível carregar os pedidos.</p>
            ) : orders.length ? (
              <ul className="mt-4 divide-y divide-[color:var(--border)]">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link href={`/pedido/${order.number}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:opacity-80">
                      <span><strong>{order.number}</strong><span className="ml-3 text-muted">{order.status}</span></span>
                      <span className="flex items-center gap-4"><span className="text-muted">{dateFormat.format(new Date(order.createdAt))}</span><strong>{formatCurrencyBRL(order.totalCents)}</strong></span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Nenhum pedido feito por esta conta.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
