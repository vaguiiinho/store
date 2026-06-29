# Checklist de PRs

Este documento transforma o plano da loja virtual em uma sequencia de PRs pequenos e verificaveis.

## PR 1 - Fundacao

- [x] Estrutura inicial do frontend criada.
- [x] Estrutura inicial do backend criada.
- [x] Layout base da aplicacao pronto.
- [x] Rotas principais definidas.
- [x] Banco e configuracao inicial preparados.
- [x] Validacao e tratamento de erros basicos prontos.

## PR 2 - Dominio e Persistencia

- [x] Entidades principais modeladas.
- [x] Repositorios definidos por contrato.
- [x] Prisma isolado na infraestrutura.
- [x] Migrations iniciais criadas.
- [x] Casos de uso basicos preparados.

## PR 3 - Catalogo Publico

- [x] Home exibindo produtos em destaque.
- [x] Listagem de produtos funcionando.
- [x] Busca e filtros basicos disponiveis.
- [x] Pagina de detalhe do produto implementada.
- [ ] Estados de loading, vazio e erro tratados.

## PR 4 - Carrinho

- [x] Adicionar item ao carrinho.
- [x] Remover item do carrinho.
- [x] Alterar quantidade.
- [x] Calcular subtotal.
- [x] Manter estado do carrinho de forma previsivel.

## PR 5 - Checkout e Pedido

- [x] Formulario de checkout implementado.
- [x] Validacao de nome, contato e endereco.
- [x] Frete fixo por regiao exibido.
- [ ] Pix e cartao via Mercado Pago disponiveis.
- [x] Pedido criado com numero e status.
- [ ] Pagina de sucesso pronta.

## PR 6 - Pagamento e Confirmacao

- [x] Contrato de gateway de pagamento definido.
- [x] Mock de retorno de pagamento disponivel.
- [x] Webhook de pagamento preparado.
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
