import { Category } from "../domain/entities/category.entity";

export type CategoryOutput = { id: string; name: string; slug: string; active: boolean };

export function toCategoryOutput(category: Category): CategoryOutput {
  return { id: category.id, name: category.name, slug: category.slug, active: category.active };
}
