import { AdminDashboard } from "../../../components/admin-dashboard";
import { PageHeader } from "../../../components/page-header";
import { UserDashboard } from "../../../components/user-dashboard";
import { getCookieHeader, requireSession } from "../../../lib/session";
import { getAdminOrders, getAdminProducts, getAdminUsers, getMyOrders, getAdminOrderSummary } from "../../../lib/storefront-api";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel" };

export default async function PainelPage() {
  // O ramo (USER/ADMIN) e decidido aqui, no servidor; a API e a autoridade (@AdminOnly).
  const user = await requireSession();
  const cookie = await getCookieHeader();

  if (user.role === "ADMIN") {
    const [summary, products, users, orders] = await Promise.all([
      getAdminOrderSummary(cookie),
      getAdminProducts(cookie),
      getAdminUsers(cookie),
      getAdminOrders(cookie)
    ]);

    // Papel rebaixado no meio da sessao: a API recusa; mostra o painel de usuario.
    if (summary.ok || summary.status !== 403) {
      return (
        <>
          <PageHeader title="Painel" />
          <AdminDashboard
            summary={summary.ok ? summary.data : null}
            products={products}
            users={users}
            recentOrders={orders ? orders.slice(0, 5) : null}
          />
        </>
      );
    }
  }

  const orders = await getMyOrders(cookie);
  return (
    <>
      <PageHeader title="Painel" />
      <UserDashboard orders={orders} />
    </>
  );
}
