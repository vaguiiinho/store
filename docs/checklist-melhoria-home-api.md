# Checklist de implementacao — home e API

## Home

- [x] Reduzir a fonte do titulo da vitrine.
- [x] Remover o card "Como comprar" e seu conteudo.
- [x] Remover os botoes "Abrir catalogo" e "Ir para checkout" da hero.
- [x] Manter as acoes equivalentes na barra de navegacao.
- [x] Organizar produtos em destaque em linha responsiva.
- [x] Substituir imagens genericas ou incoerentes por imagens relacionadas aos produtos.
- [x] Validar responsividade por breakpoints e build do Next.js.

## Dominio

- [x] Criar VO de identificador UUID.
- [x] Trocar o default do Prisma de `cuid()` para `uuid()`.
- [x] Atualizar dados de seed para UUIDs deterministas.
- [x] Validar textos, valores monetarios, quantidades e dados de contato/endereco nas entidades.
- [x] Criar testes para entidades de catalogo, carrinho, estoque e pedidos.

## Aplicacao

- [x] Declarar outputs explicitos em todos os casos de uso.
- [x] Criar testes unitarios com mocks para regras de casos de uso.
- [x] Confirmar que modulos sem todas as camadas sao modulos tecnicos/integradores, sem persistencia propria.

## Persistencia

- [x] Instalar e configurar `@testcontainers/postgresql`.
- [x] Criar fixture compartilhada que sobe PostgreSQL e aplica migracoes Prisma.
- [x] Testar repositorios de categoria, produto, estoque, cliente e pedido.
- [x] Garantir isolamento e limpeza dos dados entre testes.

## Ambiente

- [x] Criar compose de desenvolvimento apenas com PostgreSQL e porta local.
- [x] Adicionar scripts npm para subir e parar o banco local.
- [x] Atualizar documentacao de ambiente com os dois modos de execucao.
- [x] Validar build das imagens da stack completa com Docker Compose.
- [x] Validar API com Node local, migracoes, seed, health e catalogo.

## Qualidade

- [x] Executar testes unitarios da API.
- [x] Executar testes de integracao com Docker.
- [x] Executar lint.
- [x] Executar build da API e da web.
- [x] Registrar limites ou pendencias observadas.
