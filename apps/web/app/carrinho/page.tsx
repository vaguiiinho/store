import { PublicPage } from "../../components/public-page";
import { CartSection } from "../../components/cart-section";

export default function CarrinhoPage() {
  return (
    <PublicPage
      eyebrow="Carrinho"
      title="Resumo do pedido com total previsível antes do checkout."
      description="A primeira versão já separa o que é item, subtotal e próxima ação. Depois entram persistência local e controle de quantidade."
      primaryAction={{ href: "/checkout", label: "Continuar para checkout" }}
      secondaryAction={{ href: "/catalogo", label: "Adicionar mais itens" }}
    >
      <CartSection />
    </PublicPage>
  );
}
