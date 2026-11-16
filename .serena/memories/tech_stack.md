# Tech stack
- TypeScript everywhere (root `tsconfig.base.json`), npm@10 workspaces (npm is the official tool, not pnpm/yarn).
- API: NestJS 11, Prisma 6, PostgreSQL 16 (Docker), class-validator/class-transformer.
- Web: Next.js 16 (App Router, `proxy.ts` instead of middleware), React 19, Tailwind 3.
- Tests: Node built-in `node:test` + `node:assert/strict` via `ts-node/register` (no Jest); integration tests use Testcontainers PostgreSQL (needs Docker).
- Lint: ESLint 10 flat config (`eslint.config.mjs`) + typescript-eslint; Prettier for formatting.
- Deploy: Docker images on Docker Hub, VPS with docker compose + external nginx.
