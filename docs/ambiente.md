# Ambiente Local

## Objetivo

Documentar os requisitos de ambiente para desenvolver e operar a loja virtual.

## Premissas de Stack

- Node.js com TypeScript.
- Next.js no frontend.
- NestJS no backend.
- PostgreSQL como banco.
- Prisma para acesso ao banco.

## Variaveis de Ambiente Esperadas

- `DATABASE_URL`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `PAYMENT_PROVIDER_KEY`
- `PAYMENT_PROVIDER_SECRET`
- `EMAIL_PROVIDER_KEY`
- `STORAGE_BUCKET`

## Servicos Externos

- Banco PostgreSQL.
- Gateway de pagamento.
- Servico de e-mail.
- Storage de imagens, se necessario.

## Padrao de Configuracao

1. Instalar dependencias.
2. Configurar variaveis de ambiente.
3. Subir banco local.
4. Aplicar migracoes.
5. Executar frontend e backend.
6. Rodar testes antes de publicar mudancas.

## Comandos

Os comandos exatos serao preenchidos quando o projeto estiver scaffolded.

- instalar dependencias
- rodar em desenvolvimento
- testar
- lint/format
- build

