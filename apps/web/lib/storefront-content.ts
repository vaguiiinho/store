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
    slug: "cafeteria-essencial",
    name: "Cafeteira Essencial",
    description: "Modelo compacto para o ritual diário, com acabamento em aço e aquecimento rápido.",
    priceCents: 27900,
    badge: "Mais pedida",
    note: "Ideal para a primeira compra da loja.",
    details: ["Reservatório de 1,2L", "Modo economia", "Limpeza simples"],
    categories: [
      { slug: "cafe", name: "Café" }
    ]
  },
  {
    slug: "moedor-premium",
    name: "Moedor Premium",
    description: "Controle fino de moagem para quem quer consistência entre preparo e sabor.",
    priceCents: 18900,
    badge: "Novo",
    note: "Boa combinação para upsell no carrinho.",
    details: ["15 níveis de moagem", "Lâminas em cerâmica", "Base antiderrapante"],
    categories: [
      { slug: "cafe", name: "Café" },
      { slug: "acessorios", name: "Acessórios" }
    ]
  },
  {
    slug: "kit-manha-serena",
    name: "Kit Manhã Serena",
    description: "Conjunto com itens selecionados para criar uma experiência de compra completa.",
    priceCents: 12400,
    badge: "Combo",
    note: "Ótimo para testar variações e frete fixo por região.",
    details: ["Seleção curada", "Embalagem presenteável", "Envio prioritário"],
    categories: [
      { slug: "kits", name: "Kits" }
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
