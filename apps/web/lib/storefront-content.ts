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
    details: ["Reservatório de 1,2L", "Modo economia", "Limpeza simples"]
  },
  {
    slug: "moedor-premium",
    name: "Moedor Premium",
    description: "Controle fino de moagem para quem quer consistência entre preparo e sabor.",
    priceCents: 18900,
    badge: "Novo",
    note: "Boa combinação para upsell no carrinho.",
    details: ["15 níveis de moagem", "Lâminas em cerâmica", "Base antiderrapante"]
  },
  {
    slug: "kit-manha-serena",
    name: "Kit Manhã Serena",
    description: "Conjunto com itens selecionados para criar uma experiência de compra completa.",
    priceCents: 12400,
    badge: "Combo",
    note: "Ótimo para testar variações e frete fixo por região.",
    details: ["Seleção curada", "Embalagem presenteável", "Envio prioritário"]
  }
];

export const storefrontStats = [
  { value: "24h", label: "Para colocar a base no ar" },
  { value: "3 passos", label: "Do catálogo ao checkout" },
  { value: "1 fluxo", label: "Visitante primeiro, sem cadastro" }
];

export const storePillars = [
  {
    title: "Catálogo claro",
    description: "Cada produto precisa ser fácil de descobrir, comparar e abrir no detalhe."
  },
  {
    title: "Carrinho previsível",
    description: "Quantidade, subtotal e total devem se comportar sem surpresa em toda a jornada."
  },
  {
    title: "Checkout enxuto",
    description: "Como visitante, o cliente deve concluir a compra sem criar conta na v1."
  }
];
