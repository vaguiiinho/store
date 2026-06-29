# ADR 0001 - Stack Next.js, NestJS, PostgreSQL e Prisma

## Contexto

A loja virtual precisa de frontend performatico, backend organizado e persistencia confiavel.

## Decisao

Adotar:

- Next.js no frontend;
- NestJS no backend;
- PostgreSQL como banco principal;
- Prisma como ORM.

## Razao

- Next.js favorece SEO, composicao e performance no frontend.
- NestJS organiza regras, validacao e integracoes no backend.
- PostgreSQL oferece consistencia para pedidos e estoque.
- Prisma simplifica acesso a dados e migracoes.

## Alternativas Consideradas

- Monolito sem separacao de camadas.
- Framework frontend diferente.
- Banco NoSQL.

## Impacto

- Facilita manutencao e evolucao.
- Impoe separacao clara de responsabilidades.
- Exige disciplina de arquitetura nas camadas.

