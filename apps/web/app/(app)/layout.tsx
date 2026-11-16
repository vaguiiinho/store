import type { ReactNode } from "react";
import { AppShell } from "../../components/app-shell";
import { CartProvider } from "../../components/cart-provider";
import { requireSession } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  return (
    <CartProvider>
      <AppShell user={user}>{children}</AppShell>
    </CartProvider>
  );
}
