import Link from "next/link";
import { cookies } from "next/headers";
import { PageHeader } from "../../../../components/page-header";
import { StatCard, StatError } from "../../../../components/stat-card";
import { AdminStockAdjustForm } from "../../../../components/admin-stock-adjust-form";
import { requireAdmin } from "../../../../lib/session";
import { getAdminProducts } from "../../../../lib/storefront-api";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

type StockLevel = "out" | "low" | "ok" | "none";

function stockLevel(available: number | null): StockLevel {
  if (available === null) return "none";
  if (available <= 0) return "out";
  if (available <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

const levelLabel: Record<StockLevel, string> = {
  out: "Esgotado",
  low: "Baixo",
  ok: "Normal",
  none: "Sem cadastro"
};

const levelClass: Record<StockLevel, string> = {
  out: "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
  low: "border-[color:var(--danger-border)] text-[color:var(--danger)]",
  ok: "border-[color:var(--border)] text-muted",
  none: "border-[color:var(--border)] text-muted"
};

export default async function AdminEstoquePage() {
  await requireAdmin();
  const cookieHeader = (await cookies()).toString();
  const products = await getAdminProducts(cookieHeader);

  if (!products) {
    return (
      <>
        <PageHeader title="Estoque" />
        <StatError label="o estoque" />
      </>
    );
  }

  // Esgotados e com estoque baixo primeiro, para priorizar reposicao.
  const rows = products
    .map((product) => {
      const available = product.stock?.availableQuantity ?? null;
      return { product, available, reserved: product.stock?.reservedQuantity ?? 0, level: stockLevel(available) };
    })
    .sort((a, b) => (a.available ?? Number.MAX_SAFE_INTEGER) - (b.available ?? Number.MAX_SAFE_INTEGER) || a.product.name.localeCompare(b.product.name, "pt-BR"));

  const totalAvailable = rows.reduce((sum, row) => sum + (row.available ?? 0), 0);
  const totalReserved = rows.reduce((sum, row) => sum + row.reserved, 0);
  const lowCount = rows.filter((row) => row.level === "low").length;
  const outCount = rows.filter((row) => row.level === "out").length;

  return (
    <>
      <PageHeader title="Estoque" />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Unidades disponíveis" value={totalAvailable} />
          <StatCard label="Unidades reservadas" value={totalReserved} hint="Em pedidos aguardando pagamento" />
          <StatCard label="Estoque baixo" value={lowCount} hint={`Até ${LOW_STOCK_THRESHOLD} unidades`} />
          <StatCard label="Esgotados" value={outCount} />
        </div>

        {rows.length === 0 ? (
          <div className="surface rounded-[24px] p-6 text-sm text-muted">
            Nenhum produto cadastrado.{" "}
            <Link href="/admin/produtos/novo" className="font-semibold underline">
              Criar produto
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Produtos e estoque">
            {rows.map(({ product, available, reserved, level }) => (
              <li key={product.id} className="surface grid gap-4 rounded-[24px] p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div className="min-w-0">
                  <Link href={`/admin/produtos/${product.id}`} className="font-semibold hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className={`rounded-full border px-2 py-0.5 font-semibold ${levelClass[level]}`}>{levelLabel[level]}</span>
                    {product.active ? null : <span>Inativo</span>}
                  </p>
                </div>
                <dl className="flex gap-6 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Disponível</dt>
                    <dd className="text-lg font-semibold tabular-nums">{available ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Reservado</dt>
                    <dd className="text-lg font-semibold tabular-nums">{reserved}</dd>
                  </div>
                </dl>
                {available === null ? (
                  <Link href={`/admin/produtos/${product.id}`} className="text-sm font-semibold underline">
                    Cadastrar estoque no produto
                  </Link>
                ) : (
                  <AdminStockAdjustForm productId={product.id} productName={product.name} available={available} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
