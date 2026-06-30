import { PublicPage } from "../../components/public-page";
import { CartSection } from "../../components/cart-section";

export default function CarrinhoPage() {
  return (
    <PublicPage
      eyebrow="Carrinho"
      title="Resumo do pedido com total claro antes do checkout."
      description="A primeira versão já deixa item, subtotal e próxima ação na mesma tela para reduzir atrito na apresentação."
      primaryAction={{ href: "/checkout", label: "Continuar para checkout" }}
      secondaryAction={{ href: "/catalogo", label: "Adicionar mais itens" }}
    >
      <CartSection />
    </PublicPage>
  );
}
