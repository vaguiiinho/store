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
  images?: string[];
  variants?: Array<{
    name: string;
    value: string;
    sku?: string | null;
  }>;
  stock?: {
    availableQuantity: number;
    reservedQuantity: number;
  } | null;
};

export const routeLinks: RouteLink[] = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/carrinho", label: "Carrinho" },
  { href: "/checkout", label: "Checkout" }
  ,{ href: "/pedidos", label: "Meus pedidos" }
];

export const featuredProducts: FeaturedProduct[] = [
  {
    slug: "cafeteira-essencial",
    name: "Cafeteira Essencial",
    description: "Modelo compacto para o ritual diário, com acabamento em aço escovado e aquecimento rápido.",
    priceCents: 27900,
    badge: "Mais pedida",
    note: "Prática para o preparo diário.",
    details: ["Reservatório de 1,2L", "Modo economia", "Limpeza simples", "Estoque disponível"],
    categories: [
      { slug: "cafe", name: "Café" }
    ],
    images: [
      "https://images.unsplash.com/photo-1608354580875-30bd4168b351?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    variants: [
      { name: "Cor", value: "Preto", sku: "CAF-ESS-PRETO" }
    ],
    stock: {
      availableQuantity: 24,
      reservedQuantity: 2
    }
  },
  {
    slug: "moedor-premium",
    name: "Moedor Premium",
    description: "Controle fino de moagem para quem quer consistência entre preparo, aroma e sabor.",
    priceCents: 18900,
    badge: "Novo",
    note: "Excelente para mostrar complemento de compra.",
    details: ["15 níveis de moagem", "Lâminas em cerâmica", "Base antiderrapante", "Reserva mock disponível"],
    categories: [
      { slug: "cafe", name: "Café" },
      { slug: "acessorios", name: "Acessórios" }
    ],
    images: [
      "https://images.unsplash.com/photo-1780341219526-a1b2ff5bbfda?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    variants: [
      { name: "Acabamento", value: "Metal escovado", sku: "MPR-METAL" }
    ],
    stock: {
      availableQuantity: 18,
      reservedQuantity: 1
    }
  },
  {
    slug: "kit-manha-serena",
    name: "Kit Manhã Serena",
    description: "Conjunto com itens selecionados para criar uma experiência de compra mais completa e presenteável.",
    priceCents: 12400,
    badge: "Combo",
    note: "Ótimo para testar variações e frete fixo por região.",
    details: ["Seleção curada", "Embalagem presenteável", "Envio prioritário", "Estoque mock para checkout"],
    categories: [
      { slug: "kits", name: "Kits" }
    ],
    images: [
      "https://images.unsplash.com/photo-1771508732063-24f21809d45d?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    variants: [
      { name: "Embalagem", value: "Presenteável", sku: "KIT-SERENA-PRES" }
    ],
    stock: {
      availableQuantity: 31,
      reservedQuantity: 4
    }
  },
  {
    slug: "kit-presente-aroma",
    name: "Kit Presente Aroma",
    description: "Seleção pronta para presente com itens de abertura e ticket médio mais alto.",
    priceCents: 14800,
    badge: "Presente",
    note: "Bom para mostrar cross-sell e apresentação premium.",
    details: ["Caixa rígida", "Cartão presente", "Embalagem premium", "Mock de estoque reservado"],
    categories: [
      { slug: "kits", name: "Kits" },
      { slug: "presentes", name: "Presentes" }
    ],
    images: [
      "https://images.unsplash.com/photo-1768674150936-1d2044ba32d6?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    variants: [
      { name: "Embalagem", value: "Caixa rígida", sku: "KIT-AROMA-BOX" }
    ],
    stock: {
      availableQuantity: 19,
      reservedQuantity: 3
    }
  }
];

export const storefrontStats = [
  { value: "3 etapas", label: "Catálogo, carrinho e confirmação" },
  { value: "0 cadastro", label: "Checkout como visitante na v1" },
  { value: "100%", label: "Fluxo navegável de ponta a ponta" }
];

export const storePillars = [
  {
    title: "Vitrine curada",
    description: "Cada produto entra com imagem, contexto e hierarquia visual clara."
  },
  {
    title: "Carrinho legível",
    description: "Quantidade, subtotal, frete e total ficam sempre visíveis."
  },
  {
    title: "Checkout direto",
    description: "Compra como visitante, com foco no essencial e sem fricção."
  }
];
