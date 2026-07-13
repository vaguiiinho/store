import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminProductForm } from "../../../../components/admin-product-form";
import { getAdminAuthMe, getCategories } from "../../../../lib/storefront-api";

export default async function AdminNovoProdutoPage() {
  const cookieHeader = (await cookies()).toString();
  const session = await getAdminAuthMe(cookieHeader);

  if (!session?.authenticated) {
    redirect("/admin/login");
  }

  const categories = await getCategories();

  return (
    <main className="page-shell min-h-screen px-6 py-8 sm:py-12">
      <section className="surface overflow-hidden rounded-[36px]">
        <div className="grid-dots border-b border-[color:var(--border)] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Admin / Produtos</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#191310] sm:text-5xl">
              Criar produto
            </h1>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Cadastre um novo produto com nome, slug, imagens e categorias para aparecer no catálogo.
            </p>
            <p className="text-sm text-muted">Autenticado como {session.email}</p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-6">
            <Link
              href="/admin/produtos"
              className="inline-flex rounded-full border border-[color:rgba(124,79,36,0.24)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#3a281c] transition hover:bg-white"
            >
              Voltar aos produtos
            </Link>
          </div>

          {categories && categories.length > 0 ? (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-6">
              <AdminProductForm mode="create" categories={categories} />
            </div>
          ) : (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white/70 p-6 text-sm text-muted">
              Nenhuma categoria ativa disponível para criar produto.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
