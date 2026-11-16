/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { seedUnits, seedCategories, seedProducts } = require("./seed-data");

const prisma = new PrismaClient();

async function seedCatalog() {
  for (const unit of seedUnits) {
    await prisma.measurementUnit.upsert({
      where: { id: unit.id },
      create: { id: unit.id, name: unit.name, abbreviation: unit.abbreviation, active: true },
      update: { name: unit.name, abbreviation: unit.abbreviation, active: true }
    });
  }

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
        category: { connect: { slug: product.categorySlug } }
      },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        active: true,
        images: [...product.images],
        category: { connect: { slug: product.categorySlug } }
      }
    });

    // productId e UNIQUE: a migracao pode ter criado o Stock com outro id.
    await prisma.stock.upsert({
      where: { productId: product.id },
      create: {
        id: product.stock.id,
        productId: product.id,
        unitId: product.stock.unitId,
        availableQuantity: product.stock.availableQuantity,
        reservedQuantity: product.stock.reservedQuantity
      },
      update: {
        unitId: product.stock.unitId,
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
