import { redirect } from "next/navigation";

// Rota antiga mantida para links salvos: o login agora e unico para usuarios e admins.
export default function AdminLoginRedirect() {
  redirect("/login?next=/admin");
}
