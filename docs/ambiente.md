# Ambiente Local

## Objetivo

Documentar os requisitos de ambiente para desenvolver e operar a loja virtual.

## Premissas de Stack

- Node.js com TypeScript.
- Next.js no frontend.
- NestJS no backend.
- PostgreSQL como banco, via Docker.
- Prisma para acesso ao banco.

## Variaveis de Ambiente Esperadas

- `DATABASE_URL`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `API_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `PAYMENT_PROVIDER_KEY`
- `PAYMENT_PROVIDER_SECRET`
- `PAYMENT_PROVIDER`
- `PAYMENT_PROVIDER_BASE_URL`
- `PAYMENT_PROVIDER_WEBHOOK_SECRET`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `RESEND_API_KEY` (futuro)
- `STORAGE_BUCKET`

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
3. Subir banco local com `docker compose up -d`.
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
