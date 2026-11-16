import { cookies } from "next/headers";
import { PageHeader } from "../../../../../components/page-header";
import { requireAdmin } from "../../../../../lib/session";
import { AdminProductForm } from "../../../../../components/admin-product-form";
import { StatError } from "../../../../../components/stat-card";
import { getAdminCategories, getAdminUnits } from "../../../../../lib/storefront-api";

export const dynamic = "force-dynamic";

export default async function AdminNovoProdutoPage() {
  await requireAdmin();
  const cookieHeader = (await cookies()).toString();
  const [categories, units] = await Promise.all([getAdminCategories(cookieHeader), getAdminUnits(cookieHeader)]);

  if (!categories || !units) {
    return (
      <>
        <PageHeader title="Criar produto" />
        <StatError label="categorias e unidades" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Criar produto" />
      <div className="surface rounded-[28px] p-6">
        <AdminProductForm mode="create" categories={categories.filter((category) => category.active)} units={units.filter((unit) => unit.active)} />
      </div>
    </>
  );
}
