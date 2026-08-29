import assert from "node:assert/strict";
import test from "node:test";
import { Category } from "./category.entity";
import { Product } from "./product.entity";
import { Variant } from "./variant.entity";

const CATEGORY_ID = "00000000-0000-4000-8000-000000000001";
const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";

test("categoria normaliza dados e exige UUID e slug validos", () => {
  const category = Category.create({ id: CATEGORY_ID, name: " Café ", slug: "Cafe" });
  assert.equal(category.name, "Café");
  assert.equal(category.slug, "cafe");
  assert.throws(() => Category.create({ id: "categoria-1", name: "Cafe", slug: "cafe" }), /UUID v4/);
  assert.throws(() => Category.create({ name: "Cafe", slug: "cafe especial" }), /hifens/);
});

test("produto gera UUID e valida nome, preco, slug e imagens HTTPS", () => {
  const product = Product.create({
    name: " Cafeteira ",
    slug: "Cafeteira-Essencial",
    description: " Compacta ",
    priceCents: 27900,
    images: ["https://example.com/cafeteira.jpg"]
  });

  assert.match(product.id, /^[0-9a-f-]{36}$/);
  assert.equal(product.slug, "cafeteira-essencial");
  assert.throws(() => Product.create({ name: "", slug: "produto", description: "x", priceCents: 1 }), /obrigatorio/);
  assert.throws(() => Product.create({ name: "Produto", slug: "produto", description: "x", priceCents: -1 }), /negativo/);
  assert.throws(() => Product.create({ name: "Produto", slug: "produto", description: "x", priceCents: 1, images: ["http://example.com/x.jpg"] }), /HTTPS/);
});

test("variacao valida referencias e textos obrigatorios", () => {
  const variant = Variant.create({ productId: PRODUCT_ID, name: " Cor ", value: " Preto ", sku: " SKU-1 " });
  assert.equal(variant.name, "Cor");
  assert.equal(variant.value, "Preto");
  assert.equal(variant.sku, "SKU-1");
  assert.throws(() => Variant.create({ productId: PRODUCT_ID, name: "", value: "Preto" }), /obrigatorio/);
});
