# API (apps/api)
- Modules in `src/modules/<name>/`: auth, cart, catalog, health, inventory, notifications, orders, payments, shared.
- Layers per module: `domain/` (entities, repository interfaces), `application/` (use cases, services, specs), `infrastructure/prisma/` (Prisma repositories), `presentation/` (controllers, `dto/` with class-validator).
- DI: repository interfaces bound through `Symbol` tokens in `<module>.tokens.ts` (e.g. `ORDER_REPOSITORY`), wired in `<module>.module.ts`.
- Auth: global `AuthGuard` + decorators using `IS_PUBLIC_KEY` / `ROLES_KEY` from `auth/auth.tokens.ts`; order visibility via `orders/application/order-access.ts`.
- Session token encode/decode + password hashing are in-house (`auth/application/session-token.ts`, `password-hasher.ts`); `sessionVersion` invalidates sessions on password change.
- `BootstrapUsersService` syncs admin/demo users from env on app bootstrap.
- Shared Prisma service: `src/infrastructure/prisma`. Schema/migrations/seed: `prisma/`.
- Integration tests: `test/repositories.integration.spec.ts`.
- Known gap: Mercado Pago webhook signature not verified yet.
