import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: {
    default: "Loja Ritual",
    template: "%s | Loja Ritual"
  },
  description: "Demo de loja física com catálogo, carrinho, checkout visitante e confirmação de pedido."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
