import assert from "node:assert/strict";
import test from "node:test";
import { Address } from "./address.entity";
import { Order, OrderStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { Customer } from "./customer.entity";
import { Payment, PaymentMethod } from "./payment.entity";

const ORDER_ID = "40000000-0000-4000-8000-000000000001";
const ADDRESS_ID = "50000000-0000-4000-8000-000000000001";
const ITEM_ID = "60000000-0000-4000-8000-000000000001";
const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";

function createOrder() {
  return Order.create({
    id: ORDER_ID,
    number: "ORD-1",
    shippingCents: 1500,
    shippingAddress: Address.create({ id: ADDRESS_ID, cep: "01001-000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" })
  });
}

test("pedido recalcula totais e não aceita item duplicado", () => {
  const order = createOrder();
  const item = OrderItem.create({ id: ITEM_ID, productId: PRODUCT_ID, productName: "Produto", quantity: 2, unitPriceCents: 1000 });
  order.addItem(item);
  assert.equal(order.subtotalCents, 2000);
  assert.equal(order.totalCents, 3500);
  assert.throws(() => order.addItem(item), /so pode aparecer uma vez/);
});

test("endereco normaliza CEP e valida UF", () => {
  const address = Address.create({ cep: "01001-000", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "sp" });
  assert.equal(address.cep, "01001000");
  assert.equal(address.state, "SP");
  assert.throws(() => Address.create({ cep: "123", street: "Rua A", number: "1", district: "Centro", city: "Sao Paulo", state: "SP" }), /8 digitos/);
});

test("cliente normaliza contato e rejeita dados invalidos", () => {
  const customer = Customer.create({ name: " Maria ", phone: "(11) 99999-9999", email: " MARIA@EXAMPLE.COM " });
  assert.equal(customer.phone, "11999999999");
  assert.equal(customer.email, "maria@example.com");
  assert.throws(() => Customer.create({ name: "Maria", phone: "123", email: "invalido" }), /Telefone/);
});

test("item e pagamento validam quantidade, dinheiro e referencias", () => {
  assert.throws(() => OrderItem.create({ productId: PRODUCT_ID, productName: "Produto", quantity: 0, unitPriceCents: 1 }), /maior que zero/);
  assert.throws(() => Payment.create({ orderId: ORDER_ID, method: PaymentMethod.PIX, amountCents: -1 }), /negativo/);
  const payment = Payment.create({ orderId: ORDER_ID, method: PaymentMethod.PIX, amountCents: 3500, instructions: [" Copie o codigo ", ""] });
  assert.equal(payment.instructions[0], "Copie o codigo");
  assert.equal(payment.instructions.length, 1);
});

test("pedido pago não pode ser cancelado pelo fluxo de expiração", () => {
  const order = createOrder();
  order.markPaid();
  assert.equal(order.status, OrderStatus.PAID);
  assert.throws(() => order.cancel(), /nao pode ser cancelado/);
});
