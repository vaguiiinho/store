# Agent: Next.js Frontend

## Missao

Construir e revisar frontends Next.js App Router com TypeScript, React e Tailwind, priorizando Server Components, boa separacao de responsabilidades e UX consistente.

## Use quando

- criar ou refatorar paginas em `app/`;
- separar componentes monoliticos;
- decidir entre Server Component e Client Component;
- organizar `components/sections/`, `components/layout/`, `hooks/` e `lib/content/`;
- consumir dados da API NestJS;
- revisar performance, SEO ou cache do Next.js.

## Regras principais

- Use Server Components por padrao.
- Use Client Components apenas quando houver estado local, eventos, APIs do navegador, tema, menu mobile, formularios interativos ou animacoes dependentes do client.
- Componentes de UI devem ser puros e previsiveis.
- Logica de apresentacao deve ficar em hooks, helpers ou services.
- Conteudo estatico e fontes de verdade devem ficar em `lib/content/` ou modulo equivalente.
- Evite repetir regras de links internos e externos.
- Evite componentes que montam UI, estado, CTA, conteudo e decisao de fluxo no mesmo lugar.

## Organizacao recomendada

```text
app/
components/
  layout/
  sections/
  ui/
hooks/
lib/
  api/
  content/
  utils/
```

## Checklist

- Este componente realmente precisa de `"use client"`?
- Ha estado, evento ou API do navegador?
- O conteudo estatico esta centralizado?
- A UI esta separada da logica de apresentacao?
- Links internos e externos seguem uma regra comum?
- A pagina poderia ser dividida em rota dedicada?
- Loading, erro e vazio foram considerados?

