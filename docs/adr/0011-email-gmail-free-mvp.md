# ADR 0011 - E-mail Transacional com Gmail Free no MVP

## Contexto

A loja precisa enviar confirmacao de pedido e atualizacoes de status sem adicionar custo ou complexidade desnecessarios no inicio.

## Decisao

Usar Gmail free via SMTP com app password para e-mails transacionais do MVP.

## Razao

- E viavel tecnicamente com 2-step verification e app password.
- Zera custo inicial.
- E suficiente para volume baixo do MVP.

## Alternativas Consideradas

- Provedor transacional dedicado.
- E-mail manual sem automacao.

## Impacto

- O envio fica limitado ao volume e politicas da conta Gmail.
- O sistema precisa tratar falhas de SMTP.
- Futuramente pode migrar para um provedor transacional dedicado.

