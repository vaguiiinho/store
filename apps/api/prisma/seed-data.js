const DEFAULT_UNIT_ID = "00000000-0000-4000-8000-000000000101";

module.exports.seedUnits = [
  {
    id: DEFAULT_UNIT_ID,
    name: "Unidade",
    abbreviation: "un"
  }
];

module.exports.DEFAULT_UNIT_ID = DEFAULT_UNIT_ID;

module.exports.seedCategories = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Café",
    slug: "cafe"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Acessórios",
    slug: "acessorios"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Kits",
    slug: "kits"
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Presentes",
    slug: "presentes"
  }
];

module.exports.seedProducts = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Cafeteira Essencial",
    slug: "cafeteira-essencial",
    description:
      "Modelo compacto para o ritual diário, com acabamento em aço escovado e aquecimento rápido.",
    priceCents: 27900,
    images: [
      "https://images.unsplash.com/photo-1608354580875-30bd4168b351?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    categorySlug: "cafe",
    stock: {
      id: "20000000-0000-4000-8000-000000000001",
      availableQuantity: 24,
      reservedQuantity: 0,
      unitId: DEFAULT_UNIT_ID
    }
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Moedor Premium",
    slug: "moedor-premium",
    description:
      "Controle fino de moagem para quem quer consistência entre preparo, aroma e sabor.",
    priceCents: 18900,
    images: [
      "https://images.unsplash.com/photo-1780341219526-a1b2ff5bbfda?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    categorySlug: "cafe",
    stock: {
      id: "20000000-0000-4000-8000-000000000002",
      availableQuantity: 18,
      reservedQuantity: 0,
      unitId: DEFAULT_UNIT_ID
    }
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Kit Manhã Serena",
    slug: "kit-manha-serena",
    description:
      "Conjunto com itens selecionados para criar uma experiência de compra mais completa e presenteável.",
    priceCents: 12400,
    images: [
      "https://images.unsplash.com/photo-1771508732063-24f21809d45d?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    categorySlug: "kits",
    stock: {
      id: "20000000-0000-4000-8000-000000000003",
      availableQuantity: 31,
      reservedQuantity: 0,
      unitId: DEFAULT_UNIT_ID
    }
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Kit Presente Aroma",
    slug: "kit-presente-aroma",
    description:
      "Seleção pronta para presente com itens de abertura, ideal para mostrar ticket médio e cross-sell.",
    priceCents: 14800,
    images: [
      "https://images.unsplash.com/photo-1768674150936-1d2044ba32d6?auto=format&fit=crop&w=1200&h=900&q=82"
    ],
    categorySlug: "kits",
    stock: {
      id: "20000000-0000-4000-8000-000000000004",
      availableQuantity: 19,
      reservedQuantity: 0,
      unitId: DEFAULT_UNIT_ID
    }
  }
];
