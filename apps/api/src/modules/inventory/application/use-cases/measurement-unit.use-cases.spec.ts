import assert from "node:assert/strict";
import test from "node:test";
import { MeasurementUnit } from "../../domain/entities/measurement-unit.entity";
import { Stock } from "../../domain/entities/stock.entity";
import { MeasurementUnitRepository } from "../../domain/repositories/measurement-unit.repository";
import { StockRepository } from "../../domain/repositories/stock.repository";
import { ChangeStockUnitUseCase } from "./change-stock-unit.use-case";
import { CreateMeasurementUnitUseCase } from "./create-measurement-unit.use-case";
import { DeleteMeasurementUnitUseCase } from "./delete-measurement-unit.use-case";
import { ListMeasurementUnitsUseCase } from "./list-measurement-units.use-case";
import { UpdateMeasurementUnitUseCase } from "./update-measurement-unit.use-case";

class InMemoryUnits implements MeasurementUnitRepository {
  items: MeasurementUnit[] = [];
  stockCounts: Record<string, number> = {};
  private clone(u: MeasurementUnit | undefined) { return u ? new MeasurementUnit(u.id, u.name, u.abbreviation, u.active) : null; }
  async findById(id: string) { return this.clone(this.items.find((u) => u.id === id)); }
  async findByAbbreviation(a: string) { return this.clone(this.items.find((u) => u.abbreviation.toLowerCase() === a.toLowerCase())); }
  async findAll() { return this.items.map((u) => this.clone(u)!); }
  async save(unit: MeasurementUnit) { this.items = [...this.items.filter((u) => u.id !== unit.id), this.clone(unit)!]; }
  async delete(id: string) { this.items = this.items.filter((u) => u.id !== id); }
  async countStocks(id: string) { return this.stockCounts[id] ?? 0; }
  async countStocksByUnit() { return this.stockCounts; }
}

test("create unit valida sigla e rejeita duplicada sem diferenciar caixa", async () => {
  const repo = new InMemoryUnits();
  const useCase = new CreateMeasurementUnitUseCase(repo);
  const kg = await useCase.execute({ name: "Quilograma", abbreviation: "kg" });
  assert.equal(kg.active, true);
  await assert.rejects(() => useCase.execute({ name: "Outro", abbreviation: "KG" }), /Ja existe uma unidade com esta sigla\./);
  await assert.rejects(() => useCase.execute({ name: "Outro", abbreviation: "k g" }), /Sigla da unidade invalida\./);
});

test("update unit renomeia, alterna status e protege sigla de outra", async () => {
  const repo = new InMemoryUnits();
  const create = new CreateMeasurementUnitUseCase(repo);
  const kg = await create.execute({ name: "Quilo", abbreviation: "kg" });
  const g = await create.execute({ name: "Grama", abbreviation: "g" });
  const useCase = new UpdateMeasurementUnitUseCase(repo);
  const updated = await useCase.execute({ unitId: kg.id, name: "Quilograma", abbreviation: "KG", active: false });
  assert.deepEqual([updated.name, updated.abbreviation, updated.active], ["Quilograma", "KG", false]);
  await assert.rejects(() => useCase.execute({ unitId: g.id, name: "Grama", abbreviation: "kg", active: true }), /Ja existe/);
  await assert.rejects(() => useCase.execute({ unitId: "00000000-0000-4000-8000-0000000000ff", name: "X", abbreviation: "x", active: true }), /Unidade de medida nao encontrada\./);
});

test("delete unit bloqueia quando em uso", async () => {
  const repo = new InMemoryUnits();
  const kg = await new CreateMeasurementUnitUseCase(repo).execute({ name: "Quilo", abbreviation: "kg" });
  repo.stockCounts[kg.id] = 1;
  const useCase = new DeleteMeasurementUnitUseCase(repo);
  await assert.rejects(() => useCase.execute({ unitId: kg.id }), /Desative-a/);
  repo.stockCounts[kg.id] = 0;
  assert.deepEqual(await useCase.execute({ unitId: kg.id }), { deleted: true });
  await assert.rejects(() => useCase.execute({ unitId: kg.id }), /nao encontrada/);
});

test("list units ordena por nome e inclui stockCount", async () => {
  const repo = new InMemoryUnits();
  const create = new CreateMeasurementUnitUseCase(repo);
  await create.execute({ name: "Zeta", abbreviation: "z" });
  const a = await create.execute({ name: "Alfa", abbreviation: "a" });
  repo.stockCounts[a.id] = 4;
  const list = await new ListMeasurementUnitsUseCase(repo).execute({});
  assert.deepEqual(list.map((u) => [u.name, u.stockCount]), [["Alfa", 4], ["Zeta", 0]]);
});

test("change stock unit usa changeUnit do repositorio e preserva quantidades", async () => {
  const units = new InMemoryUnits();
  const un = MeasurementUnit.create({ name: "Unidade", abbreviation: "un" });
  const kg = MeasurementUnit.create({ name: "Quilo", abbreviation: "kg" });
  const off = MeasurementUnit.create({ name: "Off", abbreviation: "of", active: false });
  units.items = [un, kg, off];
  const productId = "10000000-0000-4000-8000-000000000001";
  const stock = Stock.create({ productId, availableQuantity: 7, reservedQuantity: 2, unit: un });
  const calls: Array<[string, string]> = [];
  let saved = false;
  const stocks = {
    findByProductId: async (id: string) => (id === productId ? stock : null),
    changeUnit: async (stockId: string, unitId: string) => { calls.push([stockId, unitId]); },
    save: async () => { saved = true; }
  } as unknown as StockRepository;
  const useCase = new ChangeStockUnitUseCase(stocks, units);

  const output = await useCase.execute({ productId, unitId: kg.id });
  assert.deepEqual(calls, [[stock.id, kg.id]]);
  assert.equal(saved, false);
  assert.deepEqual(output, { productId, stockId: stock.id, unit: { id: kg.id, name: "Quilo", abbreviation: "kg", active: true } });
  assert.equal(stock.available, 7);
  assert.equal(stock.reserved, 2);

  await assert.rejects(() => useCase.execute({ productId, unitId: off.id }), /Unidade de medida inativa\./);
  await assert.rejects(() => useCase.execute({ productId, unitId: "00000000-0000-4000-8000-0000000000ff" }), /Unidade de medida nao encontrada\./);
  await assert.rejects(() => useCase.execute({ productId: "00000000-0000-4000-8000-0000000000fe", unitId: kg.id }), /Estoque nao encontrado\./);
});
