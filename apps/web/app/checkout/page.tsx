import { PublicPage } from "../../components/public-page";
import { CheckoutSection } from "../../components/checkout-section";

export default async function CheckoutPage() {
  return (
    <PublicPage
      eyebrow="Checkout"
      title="Fluxo de compra como visitante, sem fricção desnecessária."
      description="O checkout já deixa preparados os blocos de contato, endereço, frete por região e escolha entre Pix e cartão via Mercado Pago."
      primaryAction={{ href: "#pagamento", label: "Ver opções de pagamento" }}
      secondaryAction={{ href: "/carrinho", label: "Revisar carrinho" }}
    >
      <CheckoutSection />
    </PublicPage>
  );
}
