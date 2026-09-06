import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const width = 1280;
const height = 720;
const outputDir = resolve("docs/videos/funcionalidades-loja");
const framesDir = resolve(outputDir, "frames");
const assetDir = resolve("docs/videos/assets");

await mkdir(framesDir, { recursive: true });

const imageFiles = ["cafeteira.jpg", "moedor.jpg", "kit-manha.jpg", "kit-presente.jpg"];
const images = await Promise.all(imageFiles.map(async (fileName) => {
  const data = await readFile(resolve(assetDir, fileName));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}));

const colors = {
  bg: "#100d14",
  bg2: "#17101f",
  panel: "#1d1725",
  panel2: "#271f31",
  border: "#4b3d59",
  accent: "#e2a2ff",
  accentStrong: "#f2c7ff",
  accentSoft: "#4b2e5d",
  text: "#f8f1ff",
  muted: "#c5b8cd",
  success: "#a7f3d0",
  warning: "#ffd18c",
};

const scenes = [
  { duration: 3.5, svg: introScene() },
  { duration: 4.5, svg: homeScene() },
  { duration: 4.5, svg: catalogScene() },
  { duration: 4.5, svg: productScene() },
  { duration: 4.5, svg: cartScene() },
  { duration: 5.5, svg: checkoutScene() },
  { duration: 4.5, svg: orderScene() },
  { duration: 5, svg: adminScene() },
  { duration: 4, svg: closingScene() },
];

const timeline = [];

for (const [index, scene] of scenes.entries()) {
  const fileName = `scene-${String(index + 1).padStart(2, "0")}.png`;
  await sharp(Buffer.from(scene.svg)).png().toFile(resolve(framesDir, fileName));
  timeline.push(`file 'frames/${fileName}'`, `duration ${scene.duration}`);
}

timeline.push(`file 'frames/scene-${String(scenes.length).padStart(2, "0")}.png'`);
await writeFile(resolve(outputDir, "timeline.txt"), `${timeline.join("\n")}\n`);

console.log(JSON.stringify({
  outputDir,
  scenes: scenes.length,
  durationSeconds: scenes.reduce((total, scene) => total + scene.duration, 0),
  resolution: `${width}x${height}`,
}));

function introScene() {
  return canvas(`
    <text x="82" y="218" class="eyebrow">LOJA VIRTUAL — VISÃO GERAL</text>
    <text x="82" y="306" class="title">Da descoberta do produto</text>
    <text x="82" y="376" class="title accent">até a gestão do pedido.</text>
    <text x="84" y="448" class="subtitle">Uma jornada completa para o cliente e para a operação.</text>
    <g transform="translate(84 510)">
      ${flowPill(0, "Catálogo")}${flowPill(190, "Carrinho")}${flowPill(380, "Checkout")}${flowPill(570, "Pedido")}${flowPill(760, "Admin")}
    </g>
  `, "FUNCIONALIDADES");
}

function homeScene() {
  const cards = [
    [images[0], "Cafeteira Essencial", "R$ 279,00"],
    [images[1], "Moedor Premium", "R$ 189,00"],
    [images[2], "Kit Manhã Serena", "R$ 124,00"],
    [images[3], "Kit Presente Aroma", "R$ 148,00"],
  ];

  return canvas(`
    ${sectionHeader("01", "Home e produtos em destaque", "A vitrine apresenta a proposta e conduz ao catálogo.")}
    <rect x="54" y="152" width="1172" height="150" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="82" y="192" class="eyebrow">LOJA ONLINE</text>
    <text x="82" y="239" class="heading">Compra simples, visual e sem cadastro obrigatório.</text>
    <text x="82" y="273" class="body">Produtos curados, navegação clara e acesso rápido ao carrinho.</text>
    <rect x="992" y="196" width="184" height="54" rx="27" fill="${colors.accent}"/>
    <text x="1084" y="230" class="button" text-anchor="middle">Abrir catálogo</text>
    ${cards.map(([image, name, price], index) => productCard(54 + index * 293, 332, image, name, price, index)).join("")}
    <text x="58" y="672" class="note">Destaques com imagem, preço e acesso direto aos detalhes do produto.</text>
  `, "VITRINE");
}

function catalogScene() {
  return canvas(`
    ${sectionHeader("02", "Catálogo com busca e categorias", "Encontre rapidamente por nome, benefício ou ocasião.")}
    <rect x="54" y="148" width="1172" height="106" rx="26" fill="${colors.panel}" stroke="${colors.border}"/>
    ${inputBox(78, 176, 590, "Buscar produto", "café para presente")}
    ${inputBox(688, 176, 270, "Categoria", "Presentes  ▾")}
    <rect x="982" y="176" width="216" height="58" rx="18" fill="${colors.accent}"/>
    <text x="1090" y="212" class="button" text-anchor="middle">Filtrar</text>
    <g transform="translate(62 278)">
      ${chip(0, "Todos", false)}${chip(112, "Café", false)}${chip(218, "Acessórios", false)}${chip(374, "Kits", false)}${chip(474, "Presentes", true)}
    </g>
    ${catalogResult(54, 340, images[3], "Kit Presente Aroma", "Kits • Presentes", "R$ 148,00", 0)}
    ${catalogResult(448, 340, images[2], "Kit Manhã Serena", "Kits", "R$ 124,00", 1)}
    ${catalogResult(842, 340, images[0], "Cafeteira Essencial", "Café", "R$ 279,00", 2)}
  `, "DESCOBERTA");
}

function productScene() {
  return canvas(`
    ${sectionHeader("03", "Detalhe do produto", "Informações essenciais antes de adicionar ao carrinho.")}
    <defs><clipPath id="detail-image"><rect x="54" y="154" width="565" height="470" rx="28"/></clipPath></defs>
    <image href="${images[3]}" x="54" y="154" width="565" height="470" preserveAspectRatio="xMidYMid slice" clip-path="url(#detail-image)"/>
    <rect x="54" y="154" width="565" height="470" rx="28" fill="none" stroke="${colors.border}"/>
    <rect x="82" y="180" width="190" height="34" rx="17" fill="${colors.panel}" opacity=".9"/>
    <text x="177" y="203" class="mini" text-anchor="middle">PRODUTO EM DESTAQUE</text>
    <rect x="650" y="154" width="576" height="470" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="682" y="202" class="eyebrow">KIT • PRESENTE</text>
    <text x="682" y="250" class="heading">Kit Presente Aroma</text>
    <text x="682" y="302" class="price">R$ 148,00</text>
    ${metric(682, 330, "19", "em estoque")}${metric(848, 330, "0", "reservados")}${metric(1014, 330, "Caixa", "variação")}
    <text x="682" y="444" class="body">Seleção pronta para presente, com embalagem rígida</text>
    <text x="682" y="474" class="body">e informações de disponibilidade em tempo real.</text>
    <rect x="682" y="520" width="510" height="66" rx="22" fill="${colors.accent}"/>
    <text x="937" y="561" class="button large" text-anchor="middle">Adicionar ao carrinho</text>
    <text x="58" y="674" class="note">Preço, estoque, categorias, descrição, variações e SKU em uma única tela.</text>
  `, "PRODUTO");
}

function cartScene() {
  return canvas(`
    ${sectionHeader("04", "Carrinho com controle de quantidade", "Revise os itens e veja o total antes de continuar.")}
    <rect x="54" y="158" width="746" height="412" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="82" y="204" class="heading-small">Itens no carrinho</text>
    ${cartItem(82, 236, "Kit Presente Aroma", "R$ 148,00", "1", images[3])}
    ${cartItem(82, 386, "Moedor Premium", "R$ 189,00", "1", images[1])}
    <rect x="830" y="158" width="396" height="412" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="862" y="204" class="eyebrow">RESUMO</text>
    ${totalRow(862, 260, "Subtotal", "R$ 337,00")}
    ${totalRow(862, 310, "Frete", "R$ 23,00")}
    <path d="M862 344 H1194" stroke="${colors.border}"/>
    ${totalRow(862, 390, "Total", "R$ 360,00", true)}
    <rect x="862" y="466" width="332" height="66" rx="22" fill="${colors.accent}"/>
    <text x="1028" y="507" class="button large" text-anchor="middle">Finalizar compra</text>
    <text x="58" y="646" class="note">Aumente, diminua ou remova itens; subtotal, frete e total são recalculados.</text>
  `, "CARRINHO");
}

function checkoutScene() {
  return canvas(`
    ${sectionHeader("05", "Checkout como visitante", "Dados, frete e pagamento sem criar uma conta.")}
    <rect x="54" y="152" width="620" height="500" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="82" y="194" class="eyebrow">CONTATO E ENDEREÇO</text>
    ${formField(82, 220, 270, "Nome", "Marina Costa")}${formField(372, 220, 270, "E-mail", "marina@email.com")}
    ${formField(82, 306, 270, "Telefone", "(11) 99999-9999")}${formField(372, 306, 270, "CEP", "01001-000")}
    ${formField(82, 392, 380, "Endereço", "Praça da Sé, 100")}${formField(482, 392, 160, "UF", "SP")}
    <rect x="82" y="500" width="560" height="112" rx="20" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="104" y="534" class="card-title">Dados lembrados com segurança no navegador</text>
    <text x="104" y="568" class="body-small">O cliente pode revisar tudo antes de confirmar.</text>
    <rect x="704" y="152" width="522" height="500" rx="28" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="732" y="194" class="eyebrow">FRETE POR REGIÃO</text>
    ${choiceCard(732, 220, 142, "Capital", "R$ 15", true)}${choiceCard(890, 220, 142, "Interior", "R$ 23", false)}${choiceCard(1048, 220, 142, "Litoral", "R$ 29", false)}
    <text x="732" y="354" class="eyebrow">PAGAMENTO</text>
    ${paymentCard(732, 382, 220, "Pix", "Confirmação via webhook", true)}${paymentCard(970, 382, 220, "Cartão", "Aprovação pelo gateway", false)}
    <rect x="732" y="536" width="458" height="76" rx="22" fill="${colors.accent}"/>
    <text x="961" y="582" class="button large" text-anchor="middle">Criar pedido • R$ 352,00</text>
  `, "CHECKOUT");
}

function orderScene() {
  return canvas(`
    ${sectionHeader("06", "Pedido criado e pagamento acompanhado", "O cliente recebe um resumo claro após a compra.")}
    <rect x="54" y="156" width="1172" height="470" rx="30" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="86" y="202" class="eyebrow">PEDIDO #LOJA-2026-0084</text>
    <rect x="938" y="174" width="244" height="42" rx="21" fill="#2d5848"/>
    <text x="1060" y="201" class="status" text-anchor="middle">AGUARDANDO PAGAMENTO</text>
    <text x="86" y="264" class="heading">Pagamento via Pix</text>
    <text x="86" y="304" class="body">Código disponível para copiar e confirmação automática pelo gateway.</text>
    <rect x="86" y="338" width="650" height="88" rx="18" fill="#dad4d7"/>
    <text x="112" y="376" class="code">00020126...LOJA RITUAL...R$352,00</text>
    <text x="112" y="404" class="code">SAO PAULO...6304ABCD</text>
    ${orderStep(86, 494, "1", "Pedido criado", true)}${orderStep(360, 494, "2", "Estoque reservado", true)}${orderStep(660, 494, "3", "Pagamento", false)}${orderStep(930, 494, "4", "Envio", false)}
    <text x="58" y="674" class="note">Status rastreável, detalhes da entrega e instruções de pagamento no mesmo lugar.</text>
  `, "PEDIDO");
}

function adminScene() {
  return canvas(`
    ${sectionHeader("07", "Painel administrativo protegido", "Produtos, estoque e pedidos na mesma operação.")}
    <rect x="54" y="152" width="1172" height="500" rx="30" fill="${colors.panel}" stroke="${colors.border}"/>
    <rect x="78" y="178" width="226" height="448" rx="22" fill="${colors.panel2}"/>
    <text x="104" y="222" class="eyebrow">ADMIN</text>
    ${navItem(104, 258, "Visão geral", false)}${navItem(104, 316, "Produtos", true)}${navItem(104, 374, "Pedidos", false)}${navItem(104, 432, "Estoque", false)}
    <rect x="330" y="178" width="872" height="86" rx="22" fill="${colors.panel2}"/>
    <text x="360" y="216" class="heading-small">Gestão de produtos</text>
    <text x="360" y="244" class="body-small">Crie, edite, ative e acompanhe o estoque.</text>
    <rect x="1010" y="194" width="166" height="52" rx="18" fill="${colors.accent}"/>
    <text x="1093" y="226" class="button" text-anchor="middle">Novo produto</text>
    ${adminRow(330, 290, "Cafeteira Essencial", "CAF-ESS-PRETO", "24", "Ativo")}
    ${adminRow(330, 376, "Moedor Premium", "MPR-METAL", "18", "Ativo")}
    ${adminRow(330, 462, "Kit Presente Aroma", "KIT-AROMA-BOX", "19", "Ativo")}
    <rect x="330" y="566" width="872" height="42" rx="15" fill="${colors.accentSoft}"/>
    <text x="766" y="593" class="body-small" text-anchor="middle">Login com cookie httpOnly e acesso exclusivo para administradores</text>
  `, "OPERAÇÃO");
}

function closingScene() {
  const benefits = [
    ["Cliente", "Descobre, compra e acompanha sem atrito."],
    ["Operação", "Controla catálogo, estoque e pedidos."],
    ["Integrações", "Pagamento, webhook e e-mail preparados."],
  ];
  return canvas(`
    <text x="74" y="128" class="eyebrow">UMA LOJA COMPLETA PARA O MVP</text>
    <text x="74" y="198" class="title-small">Vitrine, compra e operação conectadas.</text>
    ${benefits.map(([title, body], index) => {
      const x = 74 + index * 392;
      return `<rect x="${x}" y="270" width="350" height="220" rx="28" fill="${colors.panel}" stroke="${index === 1 ? colors.accent : colors.border}" stroke-width="${index === 1 ? 2 : 1}"/>
        <circle cx="${x + 52}" cy="322" r="24" fill="${colors.accentSoft}"/>
        <path d="M${x + 41} 322 l8 8 l16 -20" fill="none" stroke="${colors.accent}" stroke-width="4"/>
        <text x="${x + 30}" y="390" class="heading-small">${title}</text>
        <text x="${x + 30}" y="430" class="body-small">${body}</text>`;
    }).join("")}
    <text x="74" y="572" class="subtitle">Do primeiro clique ao acompanhamento do pedido.</text>
  `, "LOJA ONLINE");
}

function canvas(content, badge) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colors.bg}"/>
        <stop offset=".55" stop-color="${colors.bg2}"/>
        <stop offset="1" stop-color="#0c1420"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#background)"/>
    <circle cx="110" cy="80" r="280" fill="#803bad" opacity=".12"/>
    <circle cx="1190" cy="660" r="260" fill="#207b9f" opacity=".08"/>
    <style>
      text { font-family: Ubuntu, DejaVu Sans, sans-serif; fill: ${colors.text}; }
      .eyebrow { font-size: 17px; font-weight: 700; letter-spacing: 3px; fill: ${colors.accent}; }
      .title { font-size: 56px; font-weight: 700; letter-spacing: -2px; }
      .title-small { font-size: 42px; font-weight: 700; letter-spacing: -1px; }
      .heading { font-size: 31px; font-weight: 700; }
      .heading-small { font-size: 24px; font-weight: 700; }
      .subtitle { font-size: 25px; fill: ${colors.muted}; }
      .body { font-size: 20px; fill: ${colors.muted}; }
      .body-small { font-size: 17px; fill: ${colors.muted}; }
      .note { font-size: 18px; fill: ${colors.muted}; }
      .mini { font-size: 13px; font-weight: 700; letter-spacing: 2px; fill: ${colors.accentStrong}; }
      .badge { font-size: 14px; font-weight: 700; letter-spacing: 2px; fill: ${colors.muted}; }
      .card-title { font-size: 20px; font-weight: 700; }
      .price { font-size: 38px; font-weight: 700; fill: ${colors.accent}; }
      .button { font-size: 18px; font-weight: 700; fill: ${colors.bg}; }
      .button.large { font-size: 20px; }
      .field-label { font-size: 13px; font-weight: 700; fill: ${colors.muted}; }
      .field-value { font-size: 17px; }
      .status { font-size: 13px; font-weight: 700; fill: ${colors.success}; }
      .code { font-size: 16px; font-family: DejaVu Sans Mono, monospace; fill: #3c3038; }
      .accent { fill: ${colors.accent}; }
    </style>
    <rect x="1040" y="28" width="190" height="38" rx="19" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="1135" y="53" class="badge" text-anchor="middle">${badge}</text>
    ${content}
  </svg>`;
}

function sectionHeader(number, title, subtitle) {
  return `<circle cx="76" cy="76" r="27" fill="${colors.accentSoft}" stroke="${colors.accent}"/>
    <text x="76" y="84" class="card-title accent" text-anchor="middle">${number}</text>
    <text x="120" y="76" class="heading">${title}</text>
    <text x="120" y="108" class="body">${subtitle}</text>`;
}

function flowPill(x, label) {
  return `<rect x="${x}" y="0" width="160" height="54" rx="27" fill="${colors.panel}" stroke="${colors.border}"/>
    <text x="${x + 80}" y="34" class="body-small" text-anchor="middle">${label}</text>`;
}

function productCard(x, y, image, name, price, index) {
  return `<defs><clipPath id="home-${index}"><rect x="${x}" y="${y}" width="270" height="180" rx="22"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="270" height="286" rx="24" fill="${colors.panel}" stroke="${colors.border}"/>
    <image href="${image}" x="${x}" y="${y}" width="270" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#home-${index})"/>
    <text x="${x + 18}" y="${y + 218}" class="card-title">${name}</text>
    <text x="${x + 18}" y="${y + 252}" class="body-small">${price}</text>
    <text x="${x + 252}" y="${y + 252}" class="mini" text-anchor="end">VER PRODUTO</text>`;
}

function inputBox(x, y, boxWidth, label, value) {
  return `<text x="${x}" y="${y - 8}" class="field-label">${label}</text>
    <rect x="${x}" y="${y}" width="${boxWidth}" height="58" rx="18" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="${x + 18}" y="${y + 36}" class="field-value">${value}</text>`;
}

function chip(x, label, active) {
  const chipWidth = label.length * 10 + 52;
  return `<rect x="${x}" y="0" width="${chipWidth}" height="38" rx="19" fill="${active ? colors.accentSoft : colors.panel}" stroke="${active ? colors.accent : colors.border}"/>
    <text x="${x + chipWidth / 2}" y="25" class="body-small" text-anchor="middle">${label}</text>`;
}

function catalogResult(x, y, image, name, category, price, index) {
  return `<defs><clipPath id="result-${index}"><rect x="${x}" y="${y}" width="360" height="174" rx="22"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="360" height="286" rx="24" fill="${colors.panel}" stroke="${colors.border}"/>
    <image href="${image}" x="${x}" y="${y}" width="360" height="174" preserveAspectRatio="xMidYMid slice" clip-path="url(#result-${index})"/>
    <text x="${x + 20}" y="${y + 210}" class="card-title">${name}</text>
    <text x="${x + 20}" y="${y + 240}" class="body-small">${category}</text>
    <text x="${x + 20}" y="${y + 270}" class="mini">${price}</text>`;
}

function metric(x, y, value, label) {
  return `<rect x="${x}" y="${y}" width="146" height="82" rx="18" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="${x + 18}" y="${y + 34}" class="heading-small">${value}</text>
    <text x="${x + 18}" y="${y + 62}" class="body-small">${label}</text>`;
}

function cartItem(x, y, name, price, quantity, image) {
  return `<defs><clipPath id="cart-${y}"><rect x="${x}" y="${y}" width="128" height="112" rx="18"/></clipPath></defs>
    <image href="${image}" x="${x}" y="${y}" width="128" height="112" preserveAspectRatio="xMidYMid slice" clip-path="url(#cart-${y})"/>
    <text x="${x + 150}" y="${y + 36}" class="card-title">${name}</text>
    <text x="${x + 150}" y="${y + 70}" class="body-small">${price} por unidade</text>
    <rect x="${x + 470}" y="${y + 30}" width="154" height="52" rx="26" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="${x + 500}" y="${y + 63}" class="card-title">−</text><text x="${x + 547}" y="${y + 63}" class="body-small">${quantity}</text><text x="${x + 590}" y="${y + 63}" class="card-title">+</text>`;
}

function totalRow(x, y, label, value, strong = false) {
  return `<text x="${x}" y="${y}" class="${strong ? "heading-small" : "body"}">${label}</text>
    <text x="1194" y="${y}" class="${strong ? "heading-small accent" : "body"}" text-anchor="end">${value}</text>`;
}

function formField(x, y, boxWidth, label, value) {
  return `<text x="${x}" y="${y - 8}" class="field-label">${label}</text>
    <rect x="${x}" y="${y}" width="${boxWidth}" height="54" rx="16" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="${x + 16}" y="${y + 34}" class="field-value">${value}</text>`;
}

function choiceCard(x, y, boxWidth, title, price, active) {
  return `<rect x="${x}" y="${y}" width="${boxWidth}" height="92" rx="18" fill="${active ? colors.accentSoft : colors.panel2}" stroke="${active ? colors.accent : colors.border}"/>
    <text x="${x + 16}" y="${y + 34}" class="card-title">${title}</text>
    <text x="${x + 16}" y="${y + 66}" class="body-small">${price}</text>`;
}

function paymentCard(x, y, boxWidth, title, description, active) {
  return `<rect x="${x}" y="${y}" width="${boxWidth}" height="116" rx="20" fill="${active ? colors.accentSoft : colors.panel2}" stroke="${active ? colors.accent : colors.border}"/>
    <text x="${x + 18}" y="${y + 38}" class="card-title">${title}</text>
    <text x="${x + 18}" y="${y + 72}" class="body-small">${description}</text>
    <circle cx="${x + boxWidth - 24}" cy="${y + 28}" r="8" fill="${active ? colors.accent : "none"}" stroke="${active ? colors.accent : colors.muted}"/>`;
}

function orderStep(x, y, number, label, done) {
  return `<circle cx="${x + 25}" cy="${y + 25}" r="25" fill="${done ? colors.accentSoft : colors.panel2}" stroke="${done ? colors.accent : colors.border}"/>
    <text x="${x + 25}" y="${y + 32}" class="card-title ${done ? "accent" : ""}" text-anchor="middle">${number}</text>
    <text x="${x + 62}" y="${y + 32}" class="body-small">${label}</text>`;
}

function navItem(x, y, label, active) {
  return `<rect x="${x - 12}" y="${y - 30}" width="174" height="46" rx="15" fill="${active ? colors.accentSoft : "none"}"/>
    <circle cx="${x}" cy="${y - 7}" r="5" fill="${active ? colors.accent : colors.muted}"/>
    <text x="${x + 18}" y="${y}" class="body-small">${label}</text>`;
}

function adminRow(x, y, name, sku, stock, status) {
  return `<rect x="${x}" y="${y}" width="872" height="70" rx="18" fill="${colors.panel2}" stroke="${colors.border}"/>
    <text x="${x + 24}" y="${y + 31}" class="card-title">${name}</text>
    <text x="${x + 24}" y="${y + 54}" class="field-label">${sku}</text>
    <text x="${x + 570}" y="${y + 42}" class="body-small">Estoque: ${stock}</text>
    <rect x="${x + 720}" y="${y + 17}" width="112" height="36" rx="18" fill="#2d5848"/>
    <text x="${x + 776}" y="${y + 41}" class="status" text-anchor="middle">${status}</text>`;
}
