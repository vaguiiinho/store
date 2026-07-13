import assert from "node:assert/strict";
import test from "node:test";
import { Stock } from "./stock.entity";

test("reserva reduz o saldo disponível e aumenta o reservado", () => {
  const stock = Stock.create({ id: "stock-1", productId: "product-1", availableQuantity: 3 });
  stock.reserve(2);
  assert.equal(stock.available, 1);
  assert.equal(stock.reserved, 2);
});

test("estoque rejeita reserva acima do saldo", () => {
  const stock = Stock.create({ id: "stock-1", productId: "product-1", availableQuantity: 1 });
  assert.throws(() => stock.reserve(2), /insuficiente/);
});
