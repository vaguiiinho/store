import assert from "node:assert/strict";
import test from "node:test";
import { UnitAbbreviation } from "./unit-abbreviation.value-object";

test("UnitAbbreviation preserva a caixa, aceita simbolos e compara sem caixa", () => {
  assert.equal(UnitAbbreviation.create(" kg ").value, "kg");
  assert.equal(UnitAbbreviation.create("L").value, "L");
  assert.equal(UnitAbbreviation.create("m²").value, "m²");
  assert.ok(UnitAbbreviation.create("KG").equals(UnitAbbreviation.create("kg")));
  assert.ok(!UnitAbbreviation.create("kg").equals(UnitAbbreviation.create("g")));
});

test("UnitAbbreviation rejeita vazio, espacos, longo e caracteres invalidos", () => {
  for (const invalid of ["", "  ", "k g", "abcdefghi", "kg!", "a_b"]) {
    assert.throws(() => UnitAbbreviation.create(invalid), /Sigla da unidade invalida\./, invalid);
  }
});
