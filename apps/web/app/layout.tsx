import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Loja Virtual",
  description: "Loja virtual v1"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
