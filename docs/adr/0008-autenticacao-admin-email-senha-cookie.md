# ADR 0008 - Autenticacao do Admin com Email, Senha e Cookie

## Contexto

O painel administrativo precisa de acesso restrito, simples e seguro para a v1.

## Decisao

Usar autenticacao com email e senha, persistindo a sessao em cookie httpOnly, com papel `admin`.

## Razao

- E simples de operar.
- Reduz complexidade no frontend.
- Evita expor tokens em armazenamento inseguro no navegador.

## Alternativas Consideradas

- Login social.
- JWT em localStorage.
- Sessao sem cookies.

## Impacto

- A API precisara proteger rotas administrativas.
- O frontend do admin dependera de uma sessao persistida.
- O modelo de permissao pode evoluir para mais papeis depois.

