import { cookies } from "next/headers";
import { PageHeader } from "../../../../components/page-header";
import { StatError } from "../../../../components/stat-card";
import { AdminUnitForm } from "../../../../components/admin-unit-form";
import { AdminUnitActions } from "../../../../components/admin-unit-actions";
import { RulerIcon } from "../../../../components/icons";
import { requireAdmin } from "../../../../lib/session";
import { getAdminUnits } from "../../../../lib/storefront-api";

export const dynamic = "force-dynamic";

export default async function AdminUnitsPage() {
  await requireAdmin();
  const items = await getAdminUnits((await cookies()).toString());

  if (!items) {
    return (
      <>
        <PageHeader title="Unidades de medida" />
        <StatError label="as unidades" />
      </>
    );
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <>
      <PageHeader title="Unidades de medida" />
      <div className="space-y-6">
        <AdminUnitForm />
        {sorted.length === 0 ? (
          <div className="surface rounded-[24px] p-8 text-center">
            <RulerIcon className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold">Nenhuma unidade cadastrada</p>
            <p className="mt-1 text-sm text-muted">Cadastre ao menos uma unidade para criar produtos.</p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Unidades de medida">
            {sorted.map((item) => (
              <AdminUnitActions key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
