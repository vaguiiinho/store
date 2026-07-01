/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { seedCategories, seedProducts } = require("./seed-data");

const prisma = new PrismaClient();

async function seedCatalog() {
  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        active: true
      },
      update: {
        name: category.name,
        slug: category.slug,
        active: true
      }
    });
  }

  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: true,
        images: [...product.images],
        categories: {
          connect: product.categorySlugs.map((slug) => ({ slug }))
        }
      },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: true,
        images: [...product.images],
        categories: {
          set: [],
          connect: product.categorySlugs.map((slug) => ({ slug }))
        }
      }
    });

    for (const variant of product.variants) {
      await prisma.variant.upsert({
        where: { id: variant.id },
        create: {
          id: variant.id,
          productId: product.id,
          name: variant.name,
          value: variant.value,
          sku: variant.sku,
          active: true
        },
        update: {
          productId: product.id,
          name: variant.name,
          value: variant.value,
          sku: variant.sku,
          active: true
        }
      });
    }

    await prisma.stock.upsert({
      where: { id: product.stock.id },
      create: {
        id: product.stock.id,
        productId: product.id,
        availableQuantity: product.stock.availableQuantity,
        reservedQuantity: product.stock.reservedQuantity
      },
      update: {
        productId: product.id,
        availableQuantity: product.stock.availableQuantity,
        reservedQuantity: product.stock.reservedQuantity
      }
    });
  }
}

async function main() {
  await seedCatalog();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
