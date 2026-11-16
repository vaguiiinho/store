import Link from "next/link";
import { PageHeader } from "../../../../../components/page-header";
import { cookies } from "next/headers";
import { requireAdmin } from "../../../../../lib/session";
import { notFound } from "next/navigation";
import { AdminProductForm } from "../../../../../components/admin-product-form";
import { getAdminProduct } from "../../../../../lib/storefront-api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProdutoPage({ params }: PageProps) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();
  await requireAdmin();

  const productResponse = await getAdminProduct(id, cookieHeader);

  if (!productResponse) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Editar produto" />
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/produtos"
              className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
            >
              Voltar aos produtos
            </Link>
            <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-semibold accent-text">
              {productResponse.product.active ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-6">
            <AdminProductForm mode="edit" product={productResponse.product} categories={productResponse.categories.filter((category) => category.active !== false || category.id === productResponse.product.category.id)} />
          </div>
    </>
  );
}
