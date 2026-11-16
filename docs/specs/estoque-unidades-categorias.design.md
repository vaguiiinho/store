# Design — Unidades, categorias e estoque (web admin)

Complementa `estoque-unidades-categorias.md` (§8 e §9) e herda a base visual de `layout-reorganizacao.design.md` (tokens, `.surface`, foco visível, `PageHeader` só com título). Sem novas bibliotecas nem tokens. Evitar `bg-white`/`text-[#hex]` novos: usar `bg-[color:var(--surface-strong)]` e `text-[color:var(--foreground)]`. Os ícones são SVG inline em `components/icons.tsx`.

## 0. Ícones novos (`icons.tsx`, mesmo `Svg` 24x24, stroke 1.8)

`TagIcon` (categorias), `RulerIcon` (unidades), `PlusIcon`, `PencilIcon`, `TrashIcon`. `ChevronIcon` existente aponta para baixo (`m6 9 6 6 6-6`): estado aberto = sem rotação; fechado = `-rotate-90`. Reutilizar `BoxIcon` (Catálogo e Produtos), `StockIcon` (Estoque e Visão geral), `ReceiptIcon` (Vendas e Pedidos), `UsersIcon`.

## 1. Sidebar: grupos recolhíveis (admin)

**Estrutura.** Na seção "Administração" (só ADMIN), dentro do mesmo `<nav>`:

| Grupo (ícone) | Filhos |
|---|---|
| Catálogo (`BoxIcon`) | Produtos `/admin/produtos`, Categorias `/admin/categorias` (`TagIcon`) |
| Estoque (`StockIcon`) | Visão geral `/admin/estoque`, Unidades `/admin/unidades` (`RulerIcon`) |
| Vendas (`ReceiptIcon`) | Pedidos `/admin/pedidos` |
| Usuários (`UsersIcon`) | link direto `/admin/usuarios`, igual aos itens atuais |

Vendas tem um só filho. Fica como grupo por consistência com a spec (§8) e porque deve receber novos itens. Os filhos não repetem ícone, para reduzir ruído visual. Exceção: Produtos, Categorias, Visão geral e Unidades mantêm um ícone `h-4 w-4` para o alinhamento ficar uniforme.

**Cabeçalho do grupo** (`<button type="button">`, largura total):
- Classes: `flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--foreground)]` + `focusRing` do arquivo. Ícone do grupo à esquerda, rótulo `flex-1 text-left`, `ChevronIcon className="h-4 w-4 transition-transform duration-200 motion-reduce:transition-none"` à direita, com `-rotate-90` quando fechado.
- Atributos: `aria-expanded={open}`, `aria-controls="nav-group-{id}"`. Não usar `role="menu"`: é uma lista de links (disclosure), não um menu de aplicação.
- Grupo fechado que contém a rota ativa: `text-[color:var(--accent-strong)] font-semibold`, mais um ponto `h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]` antes do chevron (`aria-hidden`). O estado não depende só da cor: o ponto é uma forma, e o `aria-current` continua nos filhos.
- Grupo aberto sem rota ativa: cabeçalho em `text-[color:var(--foreground)]`.

**Filhos.** `<ul id="nav-group-{id}" className="...">` dentro de um contêiner animado:
- Contêiner: `grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none`, com `grid-rows-[1fr]` quando aberto e `grid-rows-[0fr] invisible` quando fechado. A `<ul>` interna leva `min-h-0 overflow-hidden`. Isso anima a altura sem medir o DOM nem usar JS.
- `invisible` (visibility) substitui `hidden={!open}` da spec §8: tira os links do Tab e da árvore de acessibilidade e ainda permite animar. Com `motion-reduce` a troca é instantânea.
- Indentação e guia: `ml-5 mt-1 space-y-1 border-l border-[color:var(--border)] pl-3`. A linha vertical liga visualmente os filhos ao grupo. No filho ativo, um marcador `before:absolute before:-left-[13px] before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[color:var(--accent)]` (o `li` leva `relative`) cobre a guia.
- Link filho: mesmo estilo dos itens atuais, só mais compacto (`py-2 text-sm`). O ativo usa `bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent-strong)]` e `aria-current="page"`.

**Comportamento.**
- Estado: `Record<groupId, boolean>` em `useState`. Ao montar e a cada mudança de `pathname`, abre o grupo que contém a rota ativa. Os demais mantêm o estado, e o usuário pode fechar o grupo ativo manualmente (o ponto sinaliza o ativo). Na primeira renderização o grupo ativo já nasce aberto, calculado do `pathname` (sem flash nem `useEffect` só para isso). Os outros começam fechados.
- Teclado: Tab percorre cabeçalhos e filhos visíveis na ordem natural. Enter e Espaço alternam (botão nativo). Não é preciso tratar setas, porque não é um `menu`. Foco visível em tudo (`focusRing`). Esc continua fechando só o drawer.
- `isActive` inalterado (prefixo com `/`), então `/admin/estoque` não ativa `/admin/unidades`. "Visão geral" é ativa só em `/admin/estoque` e subrotas, e nada mais usa esse prefixo.
- Leitor de tela: o cabeçalho é lido como "Catálogo, botão, expandido". A `<ul>` do grupo tem `aria-labelledby` apontando para o `id` do botão.

**Mobile (drawer).** Mesmo componente, sem variante: o drawer de 288px comporta os grupos. Os alvos de toque têm `py-2.5` (>= 40px). Fechar o drawer pela navegação não reseta o estado dos grupos, e ao reabrir o grupo ativo já está aberto. A altura passa a variar, então o `aside` ganha `overflow-y-auto` para telas baixas. O foco inicial no drawer continua no botão de fechar.

## 2. `/admin/categorias` e `/admin/unidades`

**Decisão: formulário de criação inline (cartão no topo) e edição inline na própria linha. Sem modal.** O formulário tem 2 campos (nome + slug/sigla). Um modal exigiria focus trap, retorno de foco e scroll lock sem biblioteca, para ganho nenhum. O inline mantém o contexto da lista e funciona igual no mobile. Compartilham uma estrutura única, parametrizada por campos (`admin-category-form`/`admin-unit-form` + `-actions`, folhas client).

**Layout** (`PageHeader title="Categorias"` / `"Unidades de medida"`):
1. **Cartão de criação** `surface rounded-[24px] p-5`: `<h2>` "Nova categoria". Campos em `grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end`.
   - Categoria: Nome e Slug. O slug é sugerido a partir do nome (editável) e fica em `font-mono`.
   - Unidade: Nome e Sigla (`maxLength={8}`, dica "Ex.: kg, L, m²", `w-full sm:w-28`).
   - Botão primário "Criar". Rótulos visíveis `text-sm font-semibold`, input padrão do layout.
2. **Lista** `<ul aria-label="Categorias">` com `space-y-3`; cada item é `surface rounded-[24px] p-4`.
   - Desktop: `md:grid md:grid-cols-[1fr_auto_auto] md:items-center`. Coluna 1: nome em `font-semibold`, slug ou sigla em `text-xs text-muted`. Coluna 2: contagem ("12 produtos" / "3 estoques"; singular quando for 1) em `tabular-nums text-sm text-muted`, mais a badge de status. Coluna 3: ações.
   - Mobile: uma coluna. Nome e badge na primeira linha, contagem abaixo, ações em linha própria com `flex flex-wrap gap-2`. Botões de ação com `h-11` em mobile e `sm:h-10`, e texto + ícone (não só ícone).
   - Badge de status (mesmo padrão do estoque): Ativa `border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]`; Inativa `border-[color:var(--border)] text-muted`. Sempre texto, nunca só cor.
3. **Ações da linha:** Editar (`PencilIcon`), Desativar/Ativar (botão secundário que alterna), Excluir (`TrashIcon`, texto `text-[color:var(--danger)]`, borda `--danger-border`). Todos são `<button type="button">` com `aria-label` que cita o item, p. ex. "Excluir categoria Bebidas".

**Edição inline.** Ao clicar em Editar, a linha troca para o mesmo grid de campos do cartão de criação, com valores atuais e botões "Salvar" e "Cancelar". O foco vai ao primeiro campo, e Esc cancela e devolve o foco ao botão Editar. Só uma linha é editada por vez. Desativar e ativar são ações diretas, sem confirmação, porque são reversíveis. O resultado vem pela action `saveAdmin...Action` com `active` invertido.

**Exclusão.** `AlertDialog` não existe no projeto, então usar confirmação inline: o clique em Excluir troca os botões da linha por "Confirmar exclusão?" + "Excluir" (danger) + "Cancelar", com foco em "Cancelar" (ação segura primeiro). Se a API recusar ("... Desative-a."), a linha mostra o erro `role="alert"` no padrão do layout (`--danger-*`) com a mensagem da API em texto. Quando a contagem for > 0, o botão Excluir já fica visualmente secundário, com `title`/texto "Em uso: desative em vez de excluir", mas **continua habilitado**: a barreira real é a API, e o erro explica o motivo. Sem `disabled` silencioso.

**Estados.**
| Estado | Visual |
|---|---|
| Vazio | `surface rounded-[24px] p-8 text-center` com `TagIcon`/`RulerIcon` grande em `text-muted`, "Nenhuma categoria cadastrada" e o cartão de criação acima já visível (a ação primária é o formulário). Em unidades: "Cadastre ao menos uma unidade para criar produtos". |
| Carregando | `loading.tsx` com cartão de criação + 4 linhas esqueleto `animate-pulse motion-reduce:animate-none`, mesma altura das linhas. As mutações usam `useTransition`: botão `disabled`, texto "Salvando..." / "Excluindo...", `aria-busy` na linha. |
| Erro de carga | `StatError label="as categorias"` (de `stat-card.tsx`), no padrão dos outros painéis. |
| Erro de mutação | Faixa `role="alert"` dentro da linha ou do cartão que originou (mensagem da API: slug/sigla duplicados, categoria em uso). Os dados digitados são preservados. Campo inválido ganha `aria-invalid` e `aria-describedby`. |
| Sucesso | Faixa `role="status"` com `--success-*`: "Categoria criada." / "Categoria atualizada." / "Categoria excluída.", que some após ~4 s. O cartão de criação é limpo e devolve o foco ao campo Nome. Um `router.refresh()` revalida a lista. |

## 3. `/admin/estoque`

- **Cards** (`StatCard`, grade já existente `sm:grid-cols-2 xl:grid-cols-4`): "Produtos com estoque" (disponível > 0), "Produtos com reserva" (reservado > 0; hint "Em pedidos aguardando pagamento"), "Estoque baixo" (hint "Até 5", sem a palavra "unidades"), "Esgotados". Sem somar quantidades de unidades diferentes. Os valores seguem em `tabular-nums`.
- **Linha de produto:** o `dl` mostra o valor e a sigla juntos: `<dd class="text-lg font-semibold tabular-nums">12 <abbr title="Quilograma" class="text-sm font-normal text-muted no-underline">kg</abbr></dd>`. Vale para Disponível e Reservado. O `<abbr title>` dá o nome por extenso ao leitor de tela e ao hover.
- **Trocar unidade (`AdminStockUnitSelect`):** `<select>` compacto com o padrão de input, `rounded-full px-3 py-2 text-sm`, e `<label class="sr-only">Unidade de {produto}</label>`. Fica na linha de metadados do produto (ao lado das badges), para não competir com o ajuste de entrada/saída. Lista só as unidades ativas, mais a atual (mesmo se inativa).
  - Ao mudar: se `disponível + reservado > 0`, abre o `confirm` nativo do navegador, com o texto "Trocar a unidade de {produto} para {nome}? As quantidades não são convertidas." Cancelar restaura o valor anterior. Sem saldo, aplica direto.
  - Durante a chamada, `disabled` e `aria-busy`. Erro: `role="alert"` com `text-xs text-[color:var(--danger)]` abaixo do controle. Sucesso: `aria-live="polite"` "Unidade alterada para kg." (`text-xs text-muted`) + `router.refresh()`.
- **Grid da linha:** `md:grid-cols-[1fr_auto_auto]` permanece. No mobile, `dl`, select e ajuste empilham em coluna única com `gap-3`. O formulário de ajuste (`AdminStockAdjustForm`) mostra a sigla ao lado do input ("1 kg") como `<span>` (`aria-hidden`; a sigla já está no rótulo do form) e as mensagens passam a incluir a sigla ("Entrada de 2 kg registrada.").
- "Sem cadastro" fica só como fallback defensivo (já existe no `levelLabel`), e o `<select>` não é renderizado nesse caso.

## 4. Formulário de produto

- Remove o bloco "Variante principal" inteiro (nome, valor, SKU, disponível, reservado) e o `defaultValue` das quantidades. A coluna esquerda termina em Imagens.
- Coluna direita, cartão atual (Preço permanece):
  - **Categoria:** `<label>` + `<select name="categoryId" required>` com o padrão de input (`rounded-2xl`), no lugar dos checkboxes. A primeira opção é `<option value="" disabled>Selecione...</option>` (create) ou a atual pré-selecionada (edit). Lista só as categorias ativas, mais a atual no edit (marcada "(inativa)" no texto). Abaixo, texto de ajuda `text-xs text-muted` "Cada produto tem uma categoria. Gerenciar categorias" com link para `/admin/categorias`.
  - **Create, Unidade:** `<select name="unitId" required>` com `un` pré-selecionada (pela sigla; se não existir, "Selecione..."). Opções no formato "Quilograma (kg)", só as ativas. Ajuda: "Depois de criar, a unidade só muda em Estoque."
  - **Edit, Unidade:** bloco somente leitura (não é input desabilitado, evita parecer erro): rótulo "Unidade" + valor `Quilograma (kg)` em `text-sm font-semibold` + link `Alterar em Estoque` (`/admin/estoque`, sublinhado, com foco visível). Mostra também, em `text-xs text-muted`, "Estoque: 12 kg disponível / 2 kg reservado" para dar contexto. Sem controle de quantidade (agora só em `/admin/estoque`).
- Sem categoria ou sem unidade ativa (no create): em vez do formulário, `surface rounded-[24px] p-6` com aviso `text-sm` e links "Criar categoria" / "Criar unidade" (`/admin/categorias`, `/admin/unidades`), um por pendência. O botão "Criar produto" fica `disabled` enquanto o select estiver sem valor.
- Estados do botão, erro (`role="alert"`) e sucesso (`role="status"`) inalterados. Campos `categoryId` e `unitId` inválidos exibem a mensagem da API e `aria-invalid` no `<select>` correspondente.
- Produtos `Sem categoria` (migração): no edit aparecem normalmente, e o admin recategoriza pelo `<select>`.

## 5. Acessibilidade e testes manuais (tarefa 12)

- Todo controle novo tem rótulo visível ou `sr-only`, `focusRing` e alvo >= 40px (44px no mobile).
- Validar com teclado: abrir e fechar grupos (Enter/Espaço), Tab pula filhos de grupos fechados, `/admin/unidades` aberto direto traz Estoque aberto com `aria-current="page"`, e as animações somem com `prefers-reduced-motion`. Verificar os dois temas (os tokens já cobrem as badges e as faixas de erro/sucesso).
- Os componentes de lista e de edição inline devem anunciar o resultado em regiões `aria-live`, e nunca mover o foco para fora do contexto da linha.
