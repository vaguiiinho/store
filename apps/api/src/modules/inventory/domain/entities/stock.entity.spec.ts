import assert from "node:assert/strict";
import test from "node:test";
import { MeasurementUnit } from "./measurement-unit.entity";
import { Stock } from "./stock.entity";

const STOCK_ID = "20000000-0000-4000-8000-000000000001";
const UNIT = MeasurementUnit.create({ name: "Unidade", abbreviation: "un" });
const PRODUCT_ID = "10000000-0000-4000-8000-000000000001";

test("reserva reduz o saldo disponível e aumenta o reservado", () => {
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 3, unit: UNIT });
  stock.reserve(2);
  assert.equal(stock.available, 1);
  assert.equal(stock.reserved, 2);
});

test("estoque rejeita reserva acima do saldo", () => {
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 1, unit: UNIT });
  assert.throws(() => stock.reserve(2), /insuficiente/);
});

test("estoque gera UUID e rejeita referencias e saldos invalidos", () => {
  assert.match(Stock.create({ productId: PRODUCT_ID, unit: UNIT }).id, /^[0-9a-f-]{36}$/);
  assert.throws(() => Stock.create({ productId: "produto", availableQuantity: 1, unit: UNIT }), /UUID v4/);
  assert.throws(() => Stock.create({ productId: PRODUCT_ID, reservedQuantity: -1, unit: UNIT }), /maior ou igual a zero/);
});

test("Stock.open cria 0/0 e exige unidade ativa", () => {
  const stock = Stock.open({ productId: PRODUCT_ID, unit: UNIT });
  assert.equal(stock.available, 0);
  assert.equal(stock.reserved, 0);
  const inactive = MeasurementUnit.create({ name: "Velha", abbreviation: "vl", active: false });
  assert.throws(() => Stock.open({ productId: PRODUCT_ID, unit: inactive }), /Unidade de medida inativa/);
  assert.equal(Stock.create({ productId: PRODUCT_ID, unit: inactive }).unit.id, inactive.id);
});

test("changeUnit troca a unidade sem alterar quantidades e bloqueia inativa", () => {
  const stock = Stock.create({ id: STOCK_ID, productId: PRODUCT_ID, availableQuantity: 4, reservedQuantity: 1, unit: UNIT });
  const kg = MeasurementUnit.create({ name: "Quilo", abbreviation: "kg" });
  stock.changeUnit(kg);
  assert.equal(stock.unit.id, kg.id);
  assert.equal(stock.available, 4);
  assert.equal(stock.reserved, 1);
  const inactive = MeasurementUnit.create({ name: "Velha", abbreviation: "vl", active: false });
  assert.throws(() => stock.changeUnit(inactive), /Unidade de medida inativa/);
  stock.changeUnit(kg);
});
