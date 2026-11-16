# Conventions
- Authoritative workflow/architecture rules: root `CLAUDE.md` + `.claude/agents/*.md` + `.claude/commands/feature.md` (lightweight vs full flow, handoff format, red/yellow review criteria, outputs in `docs/specs/`, `docs/adr/`, `docs/runs/`).
- Language: identifiers in English, user-facing text/comments/docs/commit messages mostly pt-BR.
- Small, verifiable changes; preserve existing style; no large rewrites.
- Web prefers Server Components; `'use client'` only at leaves (forms/interactivity/theme).
- Test doubles: in-memory repository objects implementing the domain repository interface (no mocking library).

## Agent rules vs current code
- Shared ID: `EntityId` (`EntityId.create()`, UUID v4) in `apps/api/src/modules/shared/domain/value-objects/entity-id.value-object.ts`; agents reference it. Other shared VOs: `Money`, `NonNegativeQuantity`, `RequiredText`, `Slug`; base error `shared/domain/errors/domain-error.ts`. Legacy code still calls `randomUUID()` directly in some use cases.
- Agents require use cases in `application/use-cases/`, no NestJS imports in `application/`, primitive-only Outputs. Legacy use cases sit directly in `application/`, use `@Injectable`/`@Inject(TOKEN)`, some return entities (e.g. `CreateProductOutput = Product`), and `auth/application/manage-user.use-cases.ts` groups several. New code follows agent rules; legacy migrated only when touched/requested.
- `frontend-dev` mentions `web/features/`, which does not exist; components live in `apps/web/components/` (see `mem:web/core`).
