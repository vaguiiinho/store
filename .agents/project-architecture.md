# Project Architecture Profile

Este perfil define a arquitetura recomendada para projetos derivados deste ambiente quando a stack for Next.js + NestJS.

## Objetivo

Dar um padrao simples para decidir onde cada coisa vive:

- UI e exibicao no frontend;
- regras de negocio no backend;
- integracoes e persistencia nas camadas corretas;
- testes no nivel que protege comportamento, nao detalhe interno.

## Frontend

- Framework: Next.js App Router
- Linguagem: TypeScript
- UI: React + Tailwind
- Dados: configuracao local, hooks e rotas do backend
- Objetivo arquitetural: preferir Server Components e usar Client Components apenas quando necessario

### Regras

- Priorizar Server Components sempre que nao houver estado, eventos ou APIs do navegador.
- Usar Client Components somente para:
  - formularios interativos;
  - tema;
  - menu mobile;
  - animacoes dependentes do client;
  - interacoes locais com `useState` ou `useEffect`.
- Separar UI pura, logica de apresentacao, dados e fontes de verdade.
- Evitar componentes monoliticos.
- Centralizar conteudo estatico e regras de exibicao em `lib/content/` ou modulo equivalente.
- Evitar textos e regras de links espalhados entre `data/`, `hooks/` e `components/`.
- Preferir componentes pequenos e composicao simples.

### Organizacao sugerida

```text
app/
components/
  layout/
  sections/
  ui/
hooks/
lib/
  content/
  api/
  utils/
```

### Diretriz de paginas

- A home deve ser enxuta e orientada ao fluxo principal.
- Secoes com identidade propria podem virar rotas dedicadas.
- Conteudo estatico deve ser renderizado no servidor quando possivel.

## Backend

- Framework: NestJS
- ORM: Prisma
- Banco: PostgreSQL
- Validacao: `class-validator`
- Testes: Jest unitario e integracao
- Arquitetura: Clean Architecture + Domain-Driven Design
- Modulos de dominio: Projects, Contact, Stats e Config

### Regras

- Separar camadas:
  - Domain: regras puras, sem dependencia externa.
  - Application: casos de uso.
  - Infrastructure: Prisma, banco e servicos externos.
  - Presentation: controllers e DTOs.
- Usar interfaces para repositorios.
- Aplicar Dependency Inversion entre Application e Infrastructure.
- DTOs devem usar `class-validator`.
- Controllers nao devem conter regra de negocio.
- Services devem representar casos de uso.
- Prisma deve ficar isolado na camada Infrastructure.
- Repositorios devem ser abstraidos por interfaces.
- Casos de uso devem ser testaveis sem banco real.

### Organizacao sugerida por modulo

```text
src/modules/<domain>/
  domain/
    entities/
    value-objects/
    repositories/
  application/
    use-cases/
    services/
  infrastructure/
    prisma/
    repositories/
  presentation/
    controllers/
    dto/
```

## Qualidade minima

- Testes unitarios para regras de dominio e casos de uso.
- Testes de integracao para controllers, repositorios e fluxos principais.
- Validacao explicita de entrada.
- Contratos claros entre frontend e backend.
- Erros previsiveis e sem vazamento de detalhes internos.
- Decisoes importantes devem ser registradas no contexto do projeto.
