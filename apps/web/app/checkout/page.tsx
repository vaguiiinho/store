import { PublicPage } from "../../components/public-page";
import { CheckoutSection } from "../../components/checkout-section";

export default async function CheckoutPage() {
  return (
    <PublicPage
      eyebrow="Checkout"
      title="Fluxo de compra como visitante, direto ao ponto."
      description="O checkout já organiza contato, endereço, frete por região e escolha entre Pix e cartão sem quebrar a jornada."
      primaryAction={{ href: "#pagamento", label: "Ver opções de pagamento" }}
      secondaryAction={{ href: "/carrinho", label: "Revisar carrinho" }}
    >
      <CheckoutSection />
    </PublicPage>
  );
}
