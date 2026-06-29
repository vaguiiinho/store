import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: {
    default: "Loja Ritual",
    template: "%s | Loja Ritual"
  },
  description: "Loja virtual v1 de produtos físicos com base pronta para catálogo, carrinho e checkout."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
