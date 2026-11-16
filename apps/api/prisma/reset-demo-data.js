/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { execFileSync } = require("node:child_process");
const { DEFAULT_UNIT_ID } = require("./seed-data");

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.address.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    // Depois de Product (o Stock cai em cascata); a unidade padrao fica e o seed a reaproveita.
    prisma.measurementUnit.deleteMany({ where: { id: { not: DEFAULT_UNIT_ID } } })
  ]);
  execFileSync("node", ["prisma/seed.js"], { stdio: "inherit" });
}

main().finally(() => prisma.$disconnect());
