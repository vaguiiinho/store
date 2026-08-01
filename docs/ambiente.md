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
3. Subir a stack local com `docker compose up -d --build`.
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
