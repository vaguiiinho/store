import { PublicPage } from "../../../components/public-page";
import { CartSection } from "../../../components/cart-section";

export default function CarrinhoDetalhesPage() {
  return (
    <PublicPage
      eyebrow="Carrinho"
      title="Detalhes do carrinho antes do checkout."
      description="A página replica o resumo do pedido para quem chega por um link mais direto da jornada."
      primaryAction={{ href: "/checkout", label: "Continuar para checkout" }}
      secondaryAction={{ href: "/catalogo", label: "Adicionar mais itens" }}
    >
      <CartSection />
    </PublicPage>
  );
}
