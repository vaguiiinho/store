import Link from "next/link";
import { PublicPage } from "../../../components/public-page";
import { featuredProducts } from "../../../lib/storefront-content";
import { formatCurrencyBRL } from "../../../lib/format";

type ProdutoPageProps = {
  params: { slug: string };
};

export default function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = params;
  const product = featuredProducts.find((item) => item.slug === slug);

  return (
    <PublicPage
      eyebrow="Produto"
      title={product?.name ?? "Produto em destaque"}
      description={
        product?.description ??
        "O detalhe do produto já prepara a página para exibir imagens, preço, variações e acesso ao carrinho."
      }
      primaryAction={{ href: "/carrinho", label: "Adicionar ao carrinho" }}
      secondaryAction={{ href: "/catalogo", label: "Voltar ao catálogo" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
          <div className="grid h-full min-h-[320px] place-items-center rounded-[24px] border border-dashed border-[color:rgba(124,79,36,0.28)] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(245,231,208,0.68))] p-6">
            <div className="max-w-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Imagem do produto</p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#1d1712]">
                Espaço preparado para Cloudinary e galeria
              </p>
              <p className="mt-3 text-sm text-muted">
                Este bloco substitui o placeholder por uma estrutura real para imagem principal, variações e zoom.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Preço</p>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1712]">
              {formatCurrencyBRL(product?.priceCents ?? 0)}
            </div>
            <p className="mt-3 text-sm text-muted">
              {product ? "Produto disponível para compor o primeiro fluxo do checkout." : `Slug atual: ${slug}.`}
            </p>
          </section>

          <section className="surface-strong rounded-[28px] border border-[color:var(--border)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#896139]">Próximos campos</p>
            <ul className="mt-4 space-y-3 text-sm text-[#32251c]">
              <li>Seleção de variantes e disponibilidade.</li>
              <li>Controles de quantidade com validação de estoque.</li>
              <li>Resumo do frete fixo por região.</li>
            </ul>
            <Link
              href="/checkout"
              className="mt-5 inline-flex rounded-full bg-[#1d1712] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d]"
            >
              Seguir para checkout
            </Link>
          </section>
        </aside>
      </div>
    </PublicPage>
  );
}
