"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatCurrencyBRL } from "../lib/format";
import { saveAdminProductAction } from "../app/actions/storefront-actions";

type AdminProductFormProps = {
  mode: "create" | "edit";
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    images: string[];
    categories: Array<{ id: string; name: string; slug: string }>;
    active?: boolean;
    variants?: Array<{
      id: string;
      name: string;
      value: string;
      sku: string | null;
      active: boolean;
    }>;
    stock?: {
      id: string;
      availableQuantity: number;
      reservedQuantity: number;
    } | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export function AdminProductForm({ mode, product, categories }: AdminProductFormProps) {
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
    const nextCategoryIds = formData.getAll("categoryIds").map((value) => String(value));

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
        categoryIds: nextCategoryIds,
        variantName: String(formData.get("variantName") ?? "").trim(),
        variantValue: String(formData.get("variantValue") ?? "").trim(),
        variantSku: String(formData.get("variantSku") ?? "").trim(),
        availableQuantity: Number(formData.get("availableQuantity") ?? 0),
        reservedQuantity: Number(formData.get("reservedQuantity") ?? 0)
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

  const selectedCategoryIds = new Set(product?.categories.map((category) => category.id) ?? []);
  const primaryVariant = product?.variants?.[0] ?? null;
  const currentAvailableQuantity = product?.stock?.availableQuantity ?? 0;
  const currentReservedQuantity = product?.stock?.reservedQuantity ?? 0;

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

        <div className="rounded-[28px] border border-[color:var(--border)] bg-white/80 p-5">
          <p className="text-sm font-semibold text-[#1d1712]">Variante principal</p>
          <p className="mt-1 text-xs text-muted">Os produtos da v1 usam uma variante principal e uma linha de estoque.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Nome da variante</span>
              <input
                type="text"
                name="variantName"
                defaultValue={primaryVariant?.name ?? ""}
                placeholder="Cor, tamanho, acabamento..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Valor da variante</span>
              <input
                type="text"
                name="variantValue"
                defaultValue={primaryVariant?.value ?? ""}
                placeholder="Preto, M, premium..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-semibold text-[#1d1712]">SKU</span>
            <input
              type="text"
              name="variantSku"
              defaultValue={primaryVariant?.sku ?? ""}
              placeholder="Opcional"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Disponível</span>
              <input
                type="number"
                min={0}
                step={1}
                name="availableQuantity"
                defaultValue={currentAvailableQuantity}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1d1712]">Reservado</span>
              <input
                type="number"
                min={0}
                step={1}
                name="reservedQuantity"
                defaultValue={currentReservedQuantity}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#1d1712] outline-none transition placeholder:text-[#8b6f5b] focus:border-[color:rgba(124,79,36,0.45)]"
              />
            </label>
          </div>
        </div>
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

          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold text-[#1d1712]">Categorias</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-[#2d2119]"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                    className="mt-1 h-4 w-4 rounded border-[color:var(--border)] text-[#1d1712] focus:ring-[color:rgba(124,79,36,0.25)]"
                  />
                  <span>
                    <span className="block font-semibold text-[#1d1712]">{category.name}</span>
                    <span className="block text-xs text-muted">{category.slug}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[color:rgba(153,27,27,0.24)] bg-[color:rgba(254,242,242,0.8)] p-4 text-sm text-[#7f1d1d]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-[color:rgba(22,101,52,0.18)] bg-[color:rgba(240,253,244,0.85)] p-4 text-sm text-[#166534]">
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
