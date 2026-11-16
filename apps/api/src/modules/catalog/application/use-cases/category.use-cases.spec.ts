import assert from "node:assert/strict";
import test from "node:test";
import { Category } from "../../domain/entities/category.entity";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CreateCategoryUseCase } from "./create-category.use-case";
import { DeleteCategoryUseCase } from "./delete-category.use-case";
import { ListAdminCategoriesUseCase } from "./list-admin-categories.use-case";
import { UpdateCategoryUseCase } from "./update-category.use-case";

class InMemoryCategories implements CategoryRepository {
  items: Category[] = [];
  productCounts: Record<string, number> = {};
  private clone(c: Category | undefined) { return c ? new Category(c.id, c.name, c.slug, c.active) : null; }
  async findById(id: string) { return this.clone(this.items.find((c) => c.id === id)); }
  async findBySlug(slug: string) { return this.clone(this.items.find((c) => c.slug === slug)); }
  async findAll(activeOnly = true) { return this.items.filter((c) => !activeOnly || c.active).map((c) => this.clone(c)!); }
  async save(category: Category) { this.items = [...this.items.filter((c) => c.id !== category.id), this.clone(category)!]; }
  async delete(id: string) { this.items = this.items.filter((c) => c.id !== id); }
  async countProducts(id: string) { return this.productCounts[id] ?? 0; }
  async countProductsByCategory() { return this.productCounts; }
}

test("create category normaliza, nasce ativa e rejeita slug duplicado", async () => {
  const repo = new InMemoryCategories();
  const useCase = new CreateCategoryUseCase(repo);
  const created = await useCase.execute({ name: " Cafe  Moido ", slug: "Cafe-Moido" });
  assert.deepEqual({ ...created, id: "x" }, { id: "x", name: "Cafe Moido", slug: "cafe-moido", active: true });
  await assert.rejects(() => useCase.execute({ name: "Outra", slug: "cafe-moido" }), /Ja existe uma categoria com este slug\./);
  await assert.rejects(() => useCase.execute({ name: "", slug: "x" }), /obrigatorio/);
});

test("update category renomeia, alterna status e protege slug de outra", async () => {
  const repo = new InMemoryCategories();
  const a = await new CreateCategoryUseCase(repo).execute({ name: "A", slug: "a" });
  const b = await new CreateCategoryUseCase(repo).execute({ name: "B", slug: "b" });
  const useCase = new UpdateCategoryUseCase(repo);
  const updated = await useCase.execute({ categoryId: a.id, name: "A2", slug: "a", active: false });
  assert.equal(updated.name, "A2");
  assert.equal(updated.active, false);
  await assert.rejects(() => useCase.execute({ categoryId: b.id, name: "B", slug: "a", active: true }), /Ja existe/);
  await assert.rejects(() => useCase.execute({ categoryId: "00000000-0000-4000-8000-0000000000ff", name: "B", slug: "z", active: true }), /Categoria nao encontrada\./);
});

test("delete category bloqueia quando ha produtos", async () => {
  const repo = new InMemoryCategories();
  const a = await new CreateCategoryUseCase(repo).execute({ name: "A", slug: "a" });
  repo.productCounts[a.id] = 2;
  const useCase = new DeleteCategoryUseCase(repo);
  await assert.rejects(() => useCase.execute({ categoryId: a.id }), /Desative-a/);
  repo.productCounts[a.id] = 0;
  assert.deepEqual(await useCase.execute({ categoryId: a.id }), { deleted: true });
  assert.equal(repo.items.length, 0);
  await assert.rejects(() => useCase.execute({ categoryId: a.id }), /Categoria nao encontrada\./);
});

test("list admin categories inclui inativas, contagem e ordena por nome", async () => {
  const repo = new InMemoryCategories();
  const z = await new CreateCategoryUseCase(repo).execute({ name: "Zeta", slug: "zeta" });
  await new CreateCategoryUseCase(repo).execute({ name: "Alfa", slug: "alfa" });
  await new UpdateCategoryUseCase(repo).execute({ categoryId: z.id, name: "Zeta", slug: "zeta", active: false });
  repo.productCounts[z.id] = 3;
  const list = await new ListAdminCategoriesUseCase(repo).execute({});
  assert.deepEqual(list.map((c) => [c.name, c.active, c.productCount]), [["Alfa", true, 0], ["Zeta", false, 3]]);
});
