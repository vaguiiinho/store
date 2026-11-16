import type { ReactNode } from "react";
import { requireAdmin } from "../../lib/session";

// Toda a area /admin exige papel ADMIN. A API repete a checagem em cada rota.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}
