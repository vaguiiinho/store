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
- `.env` da raiz (opcional): credenciais do PostgreSQL local do `docker-compose.yml`;
- `deploy/vps/.env`: `.env` de produção, mantido na sua máquina e enviado à VPS com `npm run deploy:env` (modelo em `deploy/vps/.env.example`; ver `docs/deploy.md`).

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

O arquivo usado nesse modo e o `docker-compose.yml` da raiz (somente PostgreSQL). As credenciais padrao sao `store/store`, banco `store`; elas podem ser sobrescritas por `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `POSTGRES_PORT` no ambiente do Compose (modelo em `.env.example` da raiz).

## Autenticacao e papeis

- Todo o site exige login; sem sessao, qualquer pagina redireciona para `/login`.
- Papeis: `USER` (catalogo, carrinho, checkout e somente os proprios pedidos) e `ADMIN` (acesso total, inclusive `/admin/usuarios`).
- Nao ha cadastro publico: somente admin cria usuarios (`/admin/usuarios` ou `POST /api/admin/users`).
- Ao subir, a API cria/sincroniza o admin de `ADMIN_EMAIL`/`ADMIN_PASSWORD` (o `.env` e a fonte da verdade da senha e do papel) e, se definidos, o usuario demo de `DEMO_USER_EMAIL`/`DEMO_USER_PASSWORD`.
- Credenciais locais do `.env.example`: admin `admin@store.local` / `admin123!`; demo `demo@store.local` / `demo12345`.
- Minha conta (`/conta`, `PATCH /api/auth/password`): qualquer usuario troca somente a propria senha, confirmando a senha atual. As outras sessoes daquela conta sao encerradas.
- Admin (`/admin/usuarios` com busca e filtros; detalhe em `/admin/usuarios/:id`): gerencia todas as contas.
  - API: `GET/POST /api/admin/users`, `GET/PATCH/DELETE /api/admin/users/:id`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/users/:id/password` e `GET /api/admin/users/:id/orders`.
  - Edita nome, e-mail e papel (a mudanca de papel vale na hora), ativa/desativa, redefine senha, exclui e ve os pedidos da conta.
  - Ninguem altera o proprio papel, nem desativa ou exclui a propria conta. Ao excluir uma conta, os pedidos dela sao mantidos, sem dono.
  - O usuario demo (`DEMO_USER_*`) e recriado e ressincronizado (senha, papel `USER`, ativo) a cada inicializacao da API.
- O admin principal (`ADMIN_EMAIL`) nao pode ser alterado pela UI: senha e status vem do ambiente.
- Na API, o guard global exige sessao por padrao; rotas abertas usam `@Public()` (catalogo, health, webhook, login/logout/me) e rotas de admin usam `@AdminOnly()`.

## Producao (VPS) e CI/CD

- Workflow: `.github/workflows/deploy.yml`. Em PR roda lint, testes unitarios, testes de integracao e build; na `main` tambem publica `store-api`/`store-web` no Docker Hub e, com `DEPLOY_ENABLED=true`, faz deploy por SSH.
- GitHub Secrets guardam so o acesso do CI/CD (Docker Hub e SSH). A config da aplicacao fica em `deploy/vps/.env` (local, fora do Git) e e enviada a VPS com `npm run deploy:env -- usuario@host`; o `deploy/vps/deploy.sh` valida as obrigatorias, faz backup do banco e sobe a versao. Detalhes em `docs/deploy.md`.
- `POSTGRES_PASSWORD` deve ser seguro para URL (letras e numeros), pois compoe a `DATABASE_URL`.

## Testes

- Unitarios da API: `npm run test:api`.
- Repositorios com PostgreSQL descartavel: `npm run test:integration`.

Os testes de integracao usam Testcontainers e exigem Docker ativo. Na primeira execucao, a imagem `postgres:16-alpine` pode ser baixada.
