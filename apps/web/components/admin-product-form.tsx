"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatCurrencyBRL } from "../lib/format";
import { saveAdminProductAction } from "../app/actions/storefront-actions";

type FormCategory = { id: string; name: string; slug: string; active?: boolean };
type FormUnit = { id: string; name: string; abbreviation: string };

type AdminProductFormProps = {
  mode: "create" | "edit";
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    images: string[];
    category: FormCategory;
    stock?: {
      id: string;
      availableQuantity: number;
      reservedQuantity: number;
      unit: FormUnit;
    } | null;
  };
  /** Categorias selecionaveis (ativas + a atual no modo edit). */
  categories: FormCategory[];
  /** Unidades ativas, usadas apenas no modo create. */
  units?: FormUnit[];
};

const inputClass =
  "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] aria-[invalid=true]:border-[color:var(--danger-border)]";
const linkClass =
  "font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

export function AdminProductForm({ mode, product, categories, units = [] }: AdminProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreate = mode === "create";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextImages = String(formData.get("images") ?? "")
      .split("\n")
      .map((image) => image.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const payload = {
        name: String(formData.get("name") ?? "").trim(),
        slug: String(formData.get("slug") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        priceCents: Number(formData.get("priceCents") ?? 0),
        images: nextImages,
        categoryId: String(formData.get("categoryId") ?? ""),
        ...(isCreate ? { unitId: String(formData.get("unitId") ?? "") } : {})
      };

      const response = await saveAdminProductAction(isCreate ? null : product?.id ?? null, payload);
      if (!response.ok || !response.data) throw new Error(response.ok ? "Nao foi possivel salvar o produto." : response.message);

      if (isCreate) {
        router.push(`/admin/produtos/${response.data.id}`);
        router.refresh();
        return;
      }

      router.refresh();
      setMessage("Produto atualizado.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao salvar produto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const defaultUnitId = units.find((unit) => unit.abbreviation.toLowerCase() === "un")?.id ?? "";
  const unit = product?.stock?.unit ?? null;
  const missingRequirements = isCreate && (categories.length === 0 || units.length === 0);

  if (missingRequirements) {
    return (
      <div className="surface rounded-[24px] p-6 text-sm">
        <p>Para criar um produto, é preciso ter ao menos uma categoria ativa e uma unidade de medida ativa.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {categories.length === 0 ? (
            <li>
              <Link href="/admin/categorias" className={linkClass}>
                Criar categoria
              </Link>
            </li>
          ) : null}
          {units.length === 0 ? (
            <li>
              <Link href="/admin/unidades" className={linkClass}>
                Criar unidade
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#1d1712]">Nome</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#1d1712]">Slug</span>
          <input
            type="text"
            name="slug"
            required
            defaultValue={product?.slug ?? ""}
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#1d1712]">Descrição</span>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={product?.description ?? ""}
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#1d1712]">Imagens</span>
          <textarea
            name="images"
            rows={5}
            defaultValue={product?.images.join("\n") ?? ""}
            placeholder="Uma URL por linha"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
          />
          <p className="text-xs text-muted">O painel grava as URLs em linhas separadas como array de imagens.</p>
        </label>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-5">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#1d1712]">Preço</span>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <input
                type="number"
                name="priceCents"
                min={1}
                step={1}
                required
                defaultValue={product?.priceCents ?? 0}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
              <p className="text-sm text-muted">{formatCurrencyBRL(product?.priceCents ?? 0)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label htmlFor="product-category" className="text-sm font-semibold text-[#1d1712]">
              Categoria
            </label>
            <select
              id="product-category"
              name="categoryId"
              required
              defaultValue={product?.category.id ?? ""}
              aria-describedby="product-category-help"
              className={inputClass}
            >
              {isCreate ? (
                <option value="" disabled>
                  Selecione...
                </option>
              ) : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.active === false ? " (inativa)" : ""}
                </option>
              ))}
            </select>
            <p id="product-category-help" className="text-xs text-muted">
              Cada produto tem uma categoria.{" "}
              <Link href="/admin/categorias" className={linkClass}>
                Gerenciar categorias
              </Link>
            </p>
          </div>

          {isCreate ? (
            <div className="mt-5 space-y-2">
              <label htmlFor="product-unit" className="text-sm font-semibold text-[#1d1712]">
                Unidade
              </label>
              <select id="product-unit" name="unitId" required defaultValue={defaultUnitId} aria-describedby="product-unit-help" className={inputClass}>
                <option value="" disabled>
                  Selecione...
                </option>
                {units.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.abbreviation})
                  </option>
                ))}
              </select>
              <p id="product-unit-help" className="text-xs text-muted">
                Depois de criar, a unidade só muda em Estoque.
              </p>
            </div>
          ) : unit ? (
            <div className="mt-5 space-y-1">
              <p className="text-sm font-semibold text-[#1d1712]">Unidade</p>
              <p className="text-sm font-semibold">
                {unit.name} ({unit.abbreviation})
              </p>
              <p>
                <Link href="/admin/estoque" className={`text-sm ${linkClass}`}>
                  Alterar em Estoque
                </Link>
              </p>
              {product?.stock ? (
                <p className="text-xs text-muted">
                  Estoque: {product.stock.availableQuantity} {unit.abbreviation} disponível / {product.stock.reservedQuantity} {unit.abbreviation} reservado
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div role="status" className="rounded-2xl border border-[color:var(--success-border)] bg-[color:var(--success-soft)] p-4 text-sm text-[color:var(--success)]">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Salvando..." : isCreate ? "Criar produto" : "Salvar produto"}
        </button>
      </div>
    </form>
  );
}
