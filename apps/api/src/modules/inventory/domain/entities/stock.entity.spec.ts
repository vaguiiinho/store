import assert from "node:assert/strict";
import test from "node:test";
import { Stock } from "./stock.entity";

const STOCK_ID = "20000000-0000-4000-8000-000000000001";
const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";

test("reserva reduz o saldo disponível e aumenta o reservado", () => {
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 3 });
  stock.reserve(2);
  assert.equal(stock.available, 1);
  assert.equal(stock.reserved, 2);
});

test("estoque rejeita reserva acima do saldo", () => {
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 1 });
  assert.throws(() => stock.reserve(2), /insuficiente/);
});

test("estoque gera UUID e rejeita referencias e saldos invalidos", () => {
  assert.match(Stock.create({ productId: PRODUCT_ID }).id, /^[0-9a-f-]{36}$/);
  assert.throws(() => Stock.create({ productId: "produto", availableQuantity: 1 }), /UUID v4/);
  assert.throws(() => Stock.create({ productId: PRODUCT_ID, reservedQuantity: -1 }), /maior ou igual a zero/);
});
