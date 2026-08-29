# Ambiente Local

## Objetivo

Documentar os requisitos de ambiente para desenvolver e operar a loja virtual.

## Premissas de Stack

- Node.js com TypeScript.
- Next.js no frontend.
- NestJS no backend.
- PostgreSQL como banco, via Docker.
- Prisma para acesso ao banco.

## Arquivos de Ambiente

Cada serviço recebe apenas as variáveis de que precisa:

- `apps/api/.env`: banco, autenticação do admin, pagamentos, e-mail, storage e URL pública da loja;
- `apps/web/.env`: URLs usadas pelo frontend (interna e pública);
- `deploy/postgres/.env`: credenciais de inicialização do PostgreSQL.

Use os respectivos arquivos `.env.example` como ponto de partida. Os arquivos reais são ignorados pelo Git.

## Servicos Externos

- Banco PostgreSQL em container Docker.
- Gateway de pagamento.
- Servico de e-mail Gmail free via SMTP.
- Storage de imagens, se necessario.

## Observacao sobre e-mail

O MVP pode usar Gmail free via SMTP. A evolucao recomendada e migrar para Resend sem mudar o contrato interno de envio.

## Padrao de Configuracao

1. Instalar dependencias.
2. Configurar variaveis de ambiente.
3. Escolher um dos modos de execucao abaixo.
4. Aplicar migracoes.
5. Executar frontend e backend.
6. Rodar testes antes de publicar mudancas.

## Comandos

Os comandos oficiais do projeto usam `npm`.

- instalar dependencias: `npm install`
- rodar em desenvolvimento: `npm run dev`
- testar: `npm test`
- lint/format: `npm run lint` e `npm run format`
- build: `npm run build`

## Modo 1 — Node local e PostgreSQL no Docker

Este modo oferece hot reload do Next.js e do NestJS usando o Node instalado na maquina.

1. Copie `apps/api/.env.example` para `apps/api/.env` e `apps/web/.env.example` para `apps/web/.env`.
2. Execute `npm run db:up` para subir apenas o PostgreSQL, publicado em `localhost:5432`.
3. Execute `npm run db:migrate:deploy` e `npm run db:seed`.
4. Execute `npm run dev` para iniciar web e API locais.
5. Ao terminar, execute `npm run db:down`.

O arquivo usado nesse modo e `docker-compose.dev.yml`. As credenciais padrao sao `store/store`, banco `store`; elas podem ser sobrescritas por `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `POSTGRES_PORT` no ambiente do Compose.

## Modo 2 — Stack completa em imagens Docker

1. Crie `deploy/postgres/.env`, `apps/api/.env` e `apps/web/.env` a partir dos exemplos.
2. Execute `docker compose up -d --build`.
3. Acesse a aplicacao em `http://localhost:82`.

No compose completo, `DATABASE_URL` e sobrescrita para usar o hostname interno `postgres`; assim o mesmo `apps/api/.env` orientado ao Node local nao quebra a imagem da API.

## Testes

- Unitarios da API: `npm run test:api`.
- Repositorios com PostgreSQL descartavel: `npm run test:integration`.

Os testes de integracao usam Testcontainers e exigem Docker ativo. Na primeira execucao, a imagem `postgres:16-alpine` pode ser baixada.
