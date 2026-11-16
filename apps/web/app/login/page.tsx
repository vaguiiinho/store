import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/login-form";
import { ThemeToggle } from "../../components/theme-toggle";
import { getSession } from "../../lib/session";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="surface w-full max-w-sm rounded-[28px] p-6">
        <p className="text-xl font-semibold">Loja Virtual</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Entrar</h1>
        <div className="mt-5">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
