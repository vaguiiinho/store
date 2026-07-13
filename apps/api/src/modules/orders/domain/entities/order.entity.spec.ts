import assert from "node:assert/strict";
import test from "node:test";
import { Address } from "./address.entity";
import { Order, OrderStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";

function createOrder() {
  return Order.create({
    id: "order-1",
    number: "ORD-1",
    shippingCents: 1500,
    shippingAddress: Address.create({ id: "address-1", cep: "01001-000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" })
  });
}

test("pedido recalcula totais e não aceita item duplicado", () => {
  const order = createOrder();
  const item = OrderItem.create({ id: "item-1", productId: "product-1", productName: "Produto", quantity: 2, unitPriceCents: 1000 });
  order.addItem(item);
  assert.equal(order.subtotalCents, 2000);
  assert.equal(order.totalCents, 3500);
  assert.throws(() => order.addItem(item), /so pode aparecer uma vez/);
});

test("pedido pago não pode ser cancelado pelo fluxo de expiração", () => {
  const order = createOrder();
  order.markPaid();
  assert.equal(order.status, OrderStatus.PAID);
  assert.throws(() => order.cancel(), /nao pode ser cancelado/);
});
