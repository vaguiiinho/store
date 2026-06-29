# Checklist de PRs

Este documento transforma o plano da loja virtual em uma sequencia de PRs pequenos e verificaveis.

## PR 1 - Fundacao

- [ ] Estrutura inicial do frontend criada.
- [ ] Estrutura inicial do backend criada.
- [ ] Layout base da aplicacao pronto.
- [ ] Rotas principais definidas.
- [ ] Banco e configuracao inicial preparados.
- [ ] Validacao e tratamento de erros basicos prontos.

## PR 2 - Dominio e Persistencia

- [ ] Entidades principais modeladas.
- [ ] Repositorios definidos por contrato.
- [ ] Prisma isolado na infraestrutura.
- [ ] Migrations iniciais criadas.
- [ ] Casos de uso basicos preparados.

## PR 3 - Catalogo Publico

- [ ] Home exibindo produtos em destaque.
- [ ] Listagem de produtos funcionando.
- [ ] Busca e filtros basicos disponiveis.
- [ ] Pagina de detalhe do produto implementada.
- [ ] Estados de loading, vazio e erro tratados.

## PR 4 - Carrinho

- [ ] Adicionar item ao carrinho.
- [ ] Remover item do carrinho.
- [ ] Alterar quantidade.
- [ ] Calcular subtotal.
- [ ] Manter estado do carrinho de forma previsivel.

## PR 5 - Checkout e Pedido

- [ ] Formulario de checkout implementado.
- [ ] Validacao de nome, contato e endereco.
- [ ] Frete fixo por regiao exibido.
- [ ] Pix e cartao via Mercado Pago disponiveis.
- [ ] Pedido criado com numero e status.
- [ ] Pagina de sucesso pronta.

## PR 6 - Pagamento e Confirmacao

- [ ] Integracao com Mercado Pago definida.
- [ ] Fluxo de Pix suportado.
- [ ] Fluxo de cartao suportado.
- [ ] Tratamento de pagamento aprovado e recusado.
- [ ] Base de notificacao de confirmacao criada.
- [ ] Envio de e-mails transacionais configurado.

## PR 7 - Admin de Produtos

- [ ] Area administrativa criada.
- [ ] CRUD de produtos pronto.
- [ ] Ativar e desativar produto.
- [ ] Gerenciar imagens, preco, variacoes e estoque.

## PR 8 - Admin de Pedidos

- [ ] Listagem de pedidos no admin.
- [ ] Detalhe do pedido.
- [ ] Atualizacao de status do pedido.
- [ ] Regras de transicao de status aplicadas.

## PR 9 - Qualidade

- [ ] Testes unitarios do dominio.
- [ ] Testes de casos de uso.
- [ ] Testes de integracao principais.
- [ ] Testes de interface para fluxos criticos.
- [ ] Revisao final com foco em regressao.

## Critérios para encerrar cada PR

- Escopo pequeno e claro.
- Mudanca funcional validada.
- Testes executados quando existirem.
- Nenhum contrato importante quebrado.
- Documentacao atualizada quando necessario.
