# ADR 0013 - Resend como Provedor Futuro de E-mail

## Contexto

O MVP da loja usa Gmail free, mas o projeto precisa de uma saida natural para um provedor transacional mais apropriado no futuro.

## Decisao

Recomendar Resend como provedor futuro de e-mail transacional.

## Razao

- E uma API de e-mail focada em desenvolvedores.
- Suporta envio transacional via API.
- Usa autenticação simples por API key.
- Tem caminho claro para recursos de entrega, limites e observabilidade.

## Alternativas Consideradas

- Permanecer em Gmail free para sempre.
- Migrar para um provedor transacional mais pesado mais tarde.

## Impacto

- A arquitetura deve manter um `EmailGateway` desacoplado do provedor.
- A migracao futura deve ser uma troca de adaptador, nao de regra de negocio.
- O MVP pode continuar com Gmail free sem bloquear a evolucao.

