import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: {
    default: "Loja Ritual",
    template: "%s | Loja Ritual"
  },
  description: "Loja com catálogo, carrinho, checkout visitante e acompanhamento de pedidos."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
