# Task completion
1. If `schema.prisma` changed: `npm run db:generate` (+ migration via `db:migrate:dev`).
2. `npm run lint`
3. `npm test` — API runs every `src/**/*.spec.ts` via glob (node:test); `npm run test:cov` adds coverage.
4. `npm run test:integration` when repositories/Prisma changed (Docker required).
5. `npm run typecheck` (tsc --noEmit for api and web).
6. `npm run build`
- CI runs lint → typecheck → unit → integration → build; `test:cov` is local only.
This mirrors the CI job in `.github/workflows/deploy.yml`; say explicitly if any step could not run.
