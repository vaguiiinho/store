# Backlog Tecnico da V1

Este backlog quebra a v1 em tarefas tecnicas suficientemente pequenas para virar issues ou PRs sem ambiguidade.

## Como usar

- Execute as tarefas na ordem sugerida.
- Cada tarefa deve caber em um PR pequeno.
- Se uma tarefa depender de outra, nao avance antes da dependencia estar pronta.
- Mantenha frontend, backend e teste separados sempre que possivel.

## Fase 1 - Fundacao

### B001 - Scaffold do projeto

- Criar a estrutura base do repositório para frontend e backend.
- Padronizar `npm` como gerenciador e scripts.
- Preparar variaveis de ambiente iniciais.

Dependencias: nenhuma

### B002 - Layout base e rotas principais

- Criar layout publico principal.
- Criar rotas iniciais da home, catalogo, produto, carrinho e checkout.
- Preparar navegacao basica entre paginas.

Dependencias: B001

### B003 - Base de configuracao e validacao

- Configurar tratamento padrao de erros.
- Configurar validacao de entrada.
- Padronizar convencoes de codigo e estrutura de pastas.

Dependencias: B001

## Fase 2 - Dominio e Persistencia

### B010 - Modelagem de produtos e catalogo

- Criar entidades Produto e Categoria.
- Definir campos basicos e relacionamentos.
- Preparar regras iniciais de ativo/inativo.

Dependencias: B001

### B011 - Modelagem de estoque e variantes

- Criar entidades Variante e Estoque.
- Definir quantidade disponivel e quantidade reservada.
- Preparar regra de bloqueio para estoque insuficiente.

Dependencias: B010

### B012 - Modelagem de carrinho e pedido

- Criar entidades Carrinho, Pedido e Item de Pedido.
- Definir subtotal, frete e total.
- Definir status inicial do pedido.

Dependencias: B010

### B013 - Modelagem de cliente, endereco e pagamento

- Criar entidades Cliente, Endereco e Pagamento.
- Definir campos obrigatorios para checkout.
- Definir estado de pagamento e relacao com pedido.

Dependencias: B012

### B014 - Contratos de repositorio e use cases iniciais

- Definir interfaces de repositorio.
- Criar casos de uso centrais para leitura de catalogo e criacao de pedido.
- Preparar dependencias de infraestrutura.

Dependencias: B010, B011, B012, B013

### B015 - Prisma e migracoes iniciais

- Criar schema inicial.
- Gerar migracoes.
- Isolar o acesso ao banco na camada de infraestrutura.

Dependencias: B010, B011, B012, B013

## Fase 3 - Catalogo Publico

### B020 - Home publica

- Exibir produtos em destaque.
- Conectar chamada para catalogo.
- Garantir SEO e renderizacao adequada.

Dependencias: B002, B014

### B021 - Listagem de produtos

- Exibir grid ou lista de produtos.
- Adicionar busca simples.
- Exibir estados de loading, vazio e erro.

Dependencias: B020

### B022 - Pagina de produto

- Exibir nome, descricao, preco, imagens, variantes e disponibilidade.
- Permitir acesso ao carrinho a partir da pagina.

Dependencias: B021

### B023 - Filtros basicos de catalogo

- Permitir filtrar por categoria.
- Preparar estrutura para filtros adicionais futuros.

Dependencias: B021

## Fase 4 - Carrinho

### B030 - Estado do carrinho

- Definir fonte de verdade do carrinho.
- Permitir persistencia local simples.
- Preparar leitura e escrita previsiveis.

Dependencias: B021

### B031 - Adicionar e remover itens

- Adicionar produto ao carrinho.
- Remover item do carrinho.
- Evitar itens duplicados sem controle.

Dependencias: B030, B022

### B032 - Alterar quantidade e recalcular totais

- Alterar quantidade de item.
- Recalcular subtotal, frete e total.
- Validar limite de estoque.

Dependencias: B031, B011

## Fase 5 - Checkout e Pedido

### B040 - Formulario de checkout

- Criar formulario com nome, contato e endereco.
- Validar dados obrigatorios.
- Preparar envio para a API.

Dependencias: B032, B013

### B041 - Regra de frete por regiao

- Configurar tabela de regioes e valores.
- Calcular frete manualmente na v1.
- Exibir valor antes da confirmacao.

Dependencias: B040

### B042 - Criacao de pedido

- Criar pedido a partir do checkout.
- Gerar numero de pedido.
- Registrar itens, subtotal, frete e total.

Dependencias: B040, B041, B012

### B043 - Pagina de sucesso e resumo

- Exibir confirmacao de compra.
- Mostrar resumo do pedido.
- Exibir status inicial do pedido.

Dependencias: B042

## Fase 6 - Pagamento

### B050 - Integracao com Mercado Pago

- Configurar credenciais.
- Preparar chamadas de pagamento.
- Definir fluxo de Pix e cartao.

Dependencias: B042

### B051 - Webhooks de pagamento

- Receber eventos do Mercado Pago.
- Atualizar status do pedido.
- Tratar pagamento aprovado, pendente e recusado.

Dependencias: B050

### B052 - Fluxo de Pix

- Gerar instrucoes de pagamento.
- Exibir QR code ou chave conforme retorno do gateway.
- Manter pedido em estado aguardando pagamento ate confirmacao.

Dependencias: B050, B051

### B053 - Fluxo de cartao

- Registrar aprovacao ou recusa.
- Tratar falhas de transacao.
- Atualizar o pedido conforme retorno.

Dependencias: B050, B051

### B054 - E-mails transacionais

- Configurar envio via Gmail free SMTP com app password.
- Enviar confirmacao de pedido.
- Enviar atualizacoes de status.
- Tratar falhas de envio sem quebrar o fluxo principal.

Dependencias: B042, B051

## Fase 7 - Admin

### B060 - Autenticacao do admin

- Criar login com email e senha.
- Persistir sessao em cookie httpOnly.
- Proteger rotas administrativas.

Dependencias: B001, B013

### B061 - CRUD de produtos

- Criar tela de listagem.
- Criar tela de edicao.
- Criar ativacao e desativacao.

Dependencias: B060, B010

### B062 - Imagens de produto

- Integrar upload com Cloudinary.
- Salvar URLs e metadados.
- Permitir reordenacao ou substituicao.

Dependencias: B061

### B063 - Estoque e variacoes no admin

- Ajustar preco, estoque e variacoes.
- Validar limites de quantidade.
- Sincronizar com regras de pedido.

Dependencias: B061, B011

### B064 - Pedidos no admin

- Listar pedidos.
- Exibir detalhe.
- Atualizar status com regras de transicao.

Dependencias: B060, B012, B051

## Fase 8 - Qualidade

### B070 - Testes de dominio

- Cobrir regras de produto, estoque e pedido.
- Cobrir transicoes de status.

Dependencias: B014, B015

### B071 - Testes de casos de uso

- Cobrir checkout.
- Cobrir criacao de pedido.
- Cobrir pagamento e atualizacao de status.

Dependencias: B042, B051

### B072 - Testes de integracao

- Cobrir APIs principais.
- Cobrir admin.
- Cobrir webhooks.

Dependencias: B061, B064

### B073 - Testes de interface

- Cobrir catalogo.
- Cobrir carrinho.
- Cobrir checkout.
- Cobrir admin essencial.

Dependencias: B020, B030, B040, B061

## Ordem Recomendada

1. B001, B002, B003
2. B010, B011, B012, B013, B014, B015
3. B020, B021, B022, B023
4. B030, B031, B032
5. B040, B041, B042, B043
6. B050, B051, B052, B053
7. B060, B061, B062, B063, B064
8. B070, B071, B072, B073

## Critérios de Corte para PR

- A tarefa tem uma entrega unica e verificavel.
- A dependencia direta foi concluida.
- O contrato publico nao foi quebrado.
- Teste relevante foi adicionado ou atualizado.
- A documentacao afetada foi revista.
