import assert from "node:assert/strict";
import test from "node:test";
import { EntityId } from "./entity-id.value-object";
import { RequiredText } from "./required-text.value-object";
import { ShortName } from "./short-name.value-object";
import { Slug } from "./slug.value-object";

test("ShortName normaliza espacos e valida tamanho", () => {
  assert.equal(ShortName.create("  Cafe   em   graos ", "Nome da categoria").value, "Cafe em graos");
  assert.throws(() => ShortName.create("   ", "Nome da categoria"), /Nome da categoria e obrigatorio\./);
  assert.throws(() => ShortName.create("a".repeat(61), "Nome"), /Nome deve ter no maximo 60 caracteres\./);
  assert.equal(ShortName.create("a".repeat(60)).value.length, 60);
  assert.ok(ShortName.create("A  b").equals(ShortName.create("A b")));
  assert.ok(!ShortName.create("A").equals(ShortName.create("a")));
});

test("equals de EntityId, Slug e RequiredText compara o valor normalizado", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  assert.ok(EntityId.create(id).equals(EntityId.create(id.toUpperCase())));
  assert.ok(!EntityId.create(id).equals(EntityId.create()));
  assert.ok(Slug.create("Cafe").equals(Slug.create("cafe")));
  assert.ok(!Slug.create("cafe").equals(Slug.create("cha")));
  assert.ok(RequiredText.create(" x ", "Campo").equals(RequiredText.create("x", "Campo")));
});
