import { PublicPage } from "../../components/public-page";
import { CheckoutSection } from "../../components/checkout-section";
import { cookies } from "next/headers";
import { getAdminAuthMe } from "../../lib/storefront-api";

export default async function CheckoutPage() {
  const session = await getAdminAuthMe((await cookies()).toString());
  return (
    <PublicPage
      eyebrow="Checkout"
      title="Fluxo de compra como visitante, direto ao ponto."
      description="O checkout já organiza contato, endereço, frete por região e escolha entre Pix e cartão sem quebrar a jornada."
      primaryAction={{ href: "#pagamento", label: "Ver opções de pagamento" }}
      secondaryAction={{ href: "/carrinho", label: "Revisar carrinho" }}
    >
      <CheckoutSection loggedEmail={session?.authenticated ? session.email : undefined} />
    </PublicPage>
  );
}
