import { PublicPage } from "../../components/public-page";
import { CheckoutSection } from "../../components/checkout-section";
import { requireSession } from "../../lib/session";

export default async function CheckoutPage() {
  const user = await requireSession();
  return (
    <PublicPage
      eyebrow="Checkout"
      title="Finalize sua compra, direto ao ponto."
      description="O checkout já organiza contato, endereço, frete por região e escolha entre Pix e cartão sem quebrar a jornada."
      primaryAction={{ href: "#pagamento", label: "Ver opções de pagamento" }}
      secondaryAction={{ href: "/carrinho", label: "Revisar carrinho" }}
    >
      <CheckoutSection loggedEmail={user.email} />
    </PublicPage>
  );
}
