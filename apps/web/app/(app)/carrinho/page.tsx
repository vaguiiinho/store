import { CartSection } from "../../../components/cart-section";
import { PageHeader } from "../../../components/page-header";
import { requireSession } from "../../../lib/session";

export const metadata = { title: "Carrinho" };

export default async function CarrinhoPage() {
  const user = await requireSession();
  return (
    <>
      <PageHeader title="Carrinho" />
      <CartSection loggedEmail={user.email} />
    </>
  );
}
