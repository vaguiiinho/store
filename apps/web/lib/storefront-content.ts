export type RouteLink = {
  href: string;
  label: string;
};

export type FeaturedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  badge: string;
  note: string;
  details: string[];
  categories: Array<{
    slug: string;
    name: string;
  }>;
};

export const routeLinks: RouteLink[] = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/carrinho", label: "Carrinho" },
  { href: "/checkout", label: "Checkout" }
];

export const featuredProducts: FeaturedProduct[] = [
  {
    slug: "cafeteira-essencial",
    name: "Cafeteira Essencial",
    description: "Modelo compacto para o ritual diário, com acabamento em aço escovado e aquecimento rápido.",
    priceCents: 27900,
    badge: "Mais pedida",
    note: "Boa peça de abertura para a apresentação da demo.",
    details: ["Reservatório de 1,2L", "Modo economia", "Limpeza simples"],
    categories: [
      { slug: "cafe", name: "Café" }
    ]
  },
  {
    slug: "moedor-premium",
    name: "Moedor Premium",
    description: "Controle fino de moagem para quem quer consistência entre preparo, aroma e sabor.",
    priceCents: 18900,
    badge: "Novo",
    note: "Excelente para mostrar complemento de compra.",
    details: ["15 níveis de moagem", "Lâminas em cerâmica", "Base antiderrapante"],
    categories: [
      { slug: "cafe", name: "Café" },
      { slug: "acessorios", name: "Acessórios" }
    ]
  },
  {
    slug: "kit-manha-serena",
    name: "Kit Manhã Serena",
    description: "Conjunto com itens selecionados para criar uma experiência de compra mais completa e presenteável.",
    priceCents: 12400,
    badge: "Combo",
    note: "Ótimo para testar variações e frete fixo por região.",
    details: ["Seleção curada", "Embalagem presenteável", "Envio prioritário"],
    categories: [
      { slug: "kits", name: "Kits" }
    ]
  },
  {
    slug: "kit-presente-aroma",
    name: "Kit Presente Aroma",
    description: "Seleção pronta para presente com itens de abertura e ticket médio mais alto.",
    priceCents: 14800,
    badge: "Presente",
    note: "Bom para mostrar cross-sell e apresentação premium.",
    details: ["Caixa rígida", "Cartão presente", "Embalagem premium"],
    categories: [
      { slug: "kits", name: "Kits" },
      { slug: "presentes", name: "Presentes" }
    ]
  }
];

export const storefrontStats = [
  { value: "24h", label: "Para subir a vitrine da demo" },
  { value: "3 etapas", label: "Do catálogo ao pedido confirmado" },
  { value: "0 cadastro", label: "Checkout como visitante na v1" }
];

export const storePillars = [
  {
    title: "Vitrine direta",
    description: "Cada produto aparece com contexto suficiente para o visitante decidir sem ruído."
  },
  {
    title: "Carrinho previsível",
    description: "Quantidade, subtotal e total continuam claros em toda a jornada, sem surpresa."
  },
  {
    title: "Checkout enxuto",
    description: "A compra termina sem cadastro e sem desvio da narrativa principal."
  }
];
