# Store — core
Loja virtual (produtos físicos), monorepo npm workspaces. Textos/UI/docs em pt-BR.

## Source map
- `apps/api` — NestJS + Prisma backend; details in `mem:api/core` (module layout, DI tokens, tests).
- `apps/web` — Next.js App Router frontend; details in `mem:web/core` (auth proxy, API client, components).
- `deploy/vps/` — prod compose, `deploy.sh` (run on VPS by CD), `push-env.sh` (sends local `deploy/vps/.env`, git-ignored).
- `.github/workflows/deploy.yml` — single CI/CD pipeline: ci → build-and-push (Docker Hub) → deploy via SSH.
- root `docker-compose.yml` — local PostgreSQL only (creds from root `.env`).
- `packages/` — empty workspace dir.

## Invariants
- Login required on every page; roles `USER`/`ADMIN`; only admin creates users; primary admin (`ADMIN_EMAIL`) protected from UI password/status changes.
- Session = httpOnly cookie `store_session`; changing `AUTH_SECRET` logs everyone out.
- Payments: Mercado Pago; freight: fixed per region; images: Cloudinary; stock reserved on order creation with expiration.
- Prod `.env` lives on VPS and is preserved by `deploy.sh`; GitHub Secrets only hold CI/CD access.

Workflow, subagents (planner, architect, ui-designer, backend-dev, frontend-dev, tester, reviewer) and `/feature` orchestrator are defined in `CLAUDE.md` and `.claude/`; gaps between those rules and current code in `mem:conventions`.

Stack/versions: `mem:tech_stack`. Commands: `mem:suggested_commands`. Code style: `mem:conventions`. Done-checklist: `mem:task_completion`.
