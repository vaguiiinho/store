import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

const seedCategories = [
  {
    id: "cat-cafe",
    name: "Café",
    slug: "cafe"
  },
  {
    id: "cat-acessorios",
    name: "Acessórios",
    slug: "acessorios"
  },
  {
    id: "cat-kits",
    name: "Kits",
    slug: "kits"
  }
] as const;

const seedProducts = [
  {
    id: "prod-cafeteira-essencial",
    name: "Cafeteira Essencial",
    slug: "cafeteria-essencial",
    description:
      "Modelo compacto para o ritual diário, com acabamento em aço e aquecimento rápido.",
    priceCents: 27900,
    images: [
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_1200/v1/sample.jpg"
    ],
    categorySlugs: ["cafe"],
    stock: {
      id: "stock-cafeteira-essencial",
      availableQuantity: 24,
      reservedQuantity: 0
    },
    variants: [
      {
        id: "variant-cafeteira-essencial-preto",
        name: "Cor",
        value: "Preto",
        sku: "CAF-ESS-PRETO"
      }
    ]
  },
  {
    id: "prod-moedor-premium",
    name: "Moedor Premium",
    slug: "moedor-premium",
    description:
      "Controle fino de moagem para quem quer consistência entre preparo e sabor.",
    priceCents: 18900,
    images: [
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_1200/v1/sample.jpg"
    ],
    categorySlugs: ["cafe", "acessorios"],
    stock: {
      id: "stock-moedor-premium",
      availableQuantity: 18,
      reservedQuantity: 0
    },
    variants: [
      {
        id: "variant-moedor-premium-metal",
        name: "Acabamento",
        value: "Metal escovado",
        sku: "MPR-METAL"
      }
    ]
  },
  {
    id: "prod-kit-manha-serena",
    name: "Kit Manhã Serena",
    slug: "kit-manha-serena",
    description:
      "Conjunto com itens selecionados para criar uma experiência de compra completa.",
    priceCents: 12400,
    images: [
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_1200/v1/sample.jpg"
    ],
    categorySlugs: ["kits"],
    stock: {
      id: "stock-kit-manha-serena",
      availableQuantity: 31,
      reservedQuantity: 0
    },
    variants: [
      {
        id: "variant-kit-manha-serena-presente",
        name: "Embalagem",
        value: "Presenteável",
        sku: "KIT-SERENA-PRES"
      }
    ]
  }
] as const;

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const productCount = await this.prisma.product.count();

    if (productCount > 0) {
      return;
    }

    for (const category of seedCategories) {
      await this.prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          active: true
        }
      });
    }

    for (const product of seedProducts) {
      await this.prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          active: true,
          images: [...product.images],
          categories: {
            connect: product.categorySlugs.map((slug) => ({ slug }))
          },
          variants: {
            create: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              value: variant.value,
              sku: variant.sku,
              active: true
            }))
          },
          stock: {
            create: {
              id: product.stock.id,
              availableQuantity: product.stock.availableQuantity,
              reservedQuantity: product.stock.reservedQuantity
            }
          }
        }
      });
    }
  }
}
