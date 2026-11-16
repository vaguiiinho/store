import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: {
    default: "Loja Virtual",
    template: "%s | Loja Virtual"
  },
  description: "Loja com catálogo, carrinho e acompanhamento de pedidos."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
