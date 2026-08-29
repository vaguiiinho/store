# Plano de melhoria da home e da API

## Objetivo

Simplificar a pagina inicial, melhorar a apresentacao dos produtos e elevar a confiabilidade do dominio e da persistencia sem alterar o escopo funcional do MVP.

## Decisoes tecnicas

- A home continua como Server Component; as mudancas sao apenas de composicao e estilo.
- As imagens de demonstracao usam URLs publicas do Unsplash coerentes com cafe, preparo e presentes.
- IDs de dominio passam a ser UUID v4, validados por um Value Object compartilhado.
- O Prisma continua armazenando IDs em `String`, mas gera novos valores com `uuid()`; a migration converte IDs legados e propaga as referencias por `ON UPDATE CASCADE`, sem uma troca destrutiva do tipo das colunas.
- Casos de uso recebem tipos explicitos de `Input` e `Output`.
- Casos de uso sao testados com repositorios mockados, porque o objetivo e isolar regra e orquestracao.
- Repositorios Prisma sao testados contra PostgreSQL real iniciado pelo Testcontainers.
- A stack completa continua no `docker-compose.yml`; o desenvolvimento com Node local usa um compose separado apenas para PostgreSQL.

## Fases

1. Ajustar hero e remover a navegacao duplicada da home.
2. Exibir produtos em destaque em uma grade horizontal responsiva e trocar imagens incoerentes.
3. Introduzir UUID e completar validacoes das entidades.
4. Adicionar testes unitarios de entidades e casos de uso.
5. Tipar outputs dos casos de uso e revisar lacunas de camadas.
6. Adicionar testes de integracao dos repositorios Prisma com Testcontainers.
7. Documentar e validar execucao via Node local e via Docker Compose de producao.

## Riscos e compatibilidade

- A migration converte CUIDs e IDs semanticos legados para UUID v4. Como a coluna permanece `String`, uma eventual troca futura para o tipo PostgreSQL `uuid` deve ser feita em outra migration e apos auditoria dos dados.
- Testes de integracao exigem Docker em execucao e podem baixar a imagem `postgres:16-alpine` na primeira vez.
- URLs externas de imagens sao adequadas para demonstracao. Em producao, o fluxo definitivo continua sendo upload e entrega pelo Cloudinary.

## Criterios de aceite

- Hero menor, sem card "Como comprar" e sem botoes duplicados.
- Produtos em destaque em linha no desktop e empilhados em telas estreitas.
- Entidades rejeitam IDs e dados essenciais invalidos.
- Todos os casos de uso expõem um tipo de output.
- Testes unitarios nao dependem de banco.
- Testes de repositorio executam as migracoes em PostgreSQL descartavel.
- `npm run dev` funciona com o PostgreSQL isolado; `docker compose up --build` continua subindo a stack completa.

## Auditoria de camadas por modulo

- `catalog`, `inventory` e `orders`: possuem dominio e persistencia; as camadas presentes correspondem ao uso atual. `inventory` nao possui controller proprio porque e consumido pelos casos de uso de catalogo e pedidos.
- `payments`: possui contrato de dominio, casos de uso, gateways de infraestrutura e controller; nao possui repositorio proprio porque `Payment` e persistido como parte do agregado `Order`.
- `cart`: possui somente entidades e contrato de repositorio. Na v1, o carrinho efetivo vive no frontend e o pedido e criado diretamente no checkout; implementar infraestrutura e endpoints agora criaria uma segunda fonte de verdade sem consumidor. A camada deve ser completada quando o carrinho persistente entrar no escopo.
- `notifications`: e um modulo de integracao sem entidade persistida; o contrato de gateway, o servico de aplicacao e os adaptadores Gmail/Resend sao suficientes.
- `admin-auth` e `health`: sao modulos tecnicos. Nao exigem todas as camadas de um modulo de dominio, mas autenticacao merece uma separacao adicional quando usuarios/sessoes passarem a ser persistidos.
