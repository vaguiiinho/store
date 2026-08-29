import assert from "node:assert/strict";
import test from "node:test";
import { Cart } from "./cart.entity";
import { CartItem } from "./cart-item.entity";

const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";

test("carrinho soma itens iguais, subtotal, frete e total", () => {
  const cart = Cart.create({ shippingCents: 1500 });
  cart.addItem(CartItem.create({ productId: PRODUCT_ID, quantity: 1, unitPriceCents: 2000 }));
  cart.addItem(CartItem.create({ productId: PRODUCT_ID, quantity: 2, unitPriceCents: 2000 }));
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(cart.subtotalCents, 6000);
  assert.equal(cart.totalCents, 7500);
});

test("carrinho e item rejeitam valores e identificadores invalidos", () => {
  assert.throws(() => Cart.create({ shippingCents: -1 }), /negativo/);
  assert.throws(() => CartItem.create({ productId: "produto", quantity: 1, unitPriceCents: 1 }), /UUID v4/);
  assert.throws(() => CartItem.create({ productId: PRODUCT_ID, quantity: 0, unitPriceCents: 1 }), /maior que zero/);
});
