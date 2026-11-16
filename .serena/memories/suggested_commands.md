# Commands (run from repo root)
- `npm run db:up` / `db:down` — local Postgres container.
- `npm run db:generate` — Prisma client (needed before build/test after schema changes).
- `npm run db:migrate:dev` — create/apply migration (dev); `db:migrate:deploy` for prod-like.
- `npm run db:seed`, `npm run db:reset-demo` — seed / reset demo data.
- `npm run dev` (both), `dev:web`, `dev:api`.
- `npm run lint` | `lint:api` | `lint:web`; `npm run format`.
- `npm test` (unit), `npm run test:integration` (Docker required), `npm run build`.
- `npm run deploy:env` — push `deploy/vps/.env` to VPS (preserves CD-managed keys; blocks on POSTGRES_PASSWORD change).
- Workspace-specific: `npm run <script> --workspace api|web`.
