import type { ReactNode } from "react";
import type { SessionUser } from "../src/services/storefront-api";
import { AppFooter } from "./app-footer";
import { AppSidebar } from "./app-sidebar";
import { CartNavLink } from "./cart-nav-link";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-[color:var(--surface-strong)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar
        role={user.role}
        topbarActions={
          <>
            <CartNavLink />
            <ThemeToggle />
            <UserMenu user={user} />
          </>
        }
        footer={<AppFooter />}
      >
        {children}
      </AppSidebar>
    </>
  );
}
