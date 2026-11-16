import assert from "node:assert/strict";
import test from "node:test";
import { MeasurementUnit } from "./measurement-unit.entity";

test("unidade valida nome, sigla e id", () => {
  const unit = MeasurementUnit.create({ name: "  Quilo  grama ", abbreviation: " kg " });
  assert.equal(unit.name, "Quilo grama");
  assert.equal(unit.abbreviation, "kg");
  assert.equal(unit.active, true);
  assert.match(unit.id, /^[0-9a-f-]{36}$/);
  assert.throws(() => MeasurementUnit.create({ name: "", abbreviation: "kg" }), /obrigatorio/);
  assert.throws(() => MeasurementUnit.create({ name: "Quilo", abbreviation: "k g" }), /Sigla da unidade invalida/);
  assert.throws(() => MeasurementUnit.create({ id: "x", name: "Quilo", abbreviation: "kg" }), /UUID v4/);
});

test("unidade renomeia, ativa/desativa e bloqueia atribuicao quando inativa", () => {
  const unit = MeasurementUnit.create({ name: "Quilo", abbreviation: "kg" });
  unit.rename("Litro", "L");
  assert.equal(unit.abbreviation, "L");
  assert.throws(() => unit.rename("", "L"), /obrigatorio/);
  unit.ensureAssignable();
  unit.deactivate();
  assert.throws(() => unit.ensureAssignable(), /Unidade de medida inativa\./);
  unit.activate();
  unit.ensureAssignable();
});
