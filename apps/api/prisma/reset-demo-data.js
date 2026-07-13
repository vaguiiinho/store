/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { execFileSync } = require("node:child_process");

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
    prisma.category.deleteMany()
  ]);
  execFileSync("node", ["prisma/seed.js"], { stdio: "inherit" });
}

main().finally(() => prisma.$disconnect());
