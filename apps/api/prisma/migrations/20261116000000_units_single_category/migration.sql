-- Unidades de medida, categoria unica por produto e Stock obrigatorio por produto.
-- Spec: docs/specs/estoque-unidades-categorias.md (§4). ADR: docs/adr/0001-categoria-unica-e-unidade-no-estoque.md
--
-- PERDA DE DADOS INTENCIONAL: as categorias secundarias de cada produto sao descartadas
-- (fica a de menor "Category"."createdAt", empate por "slug"). Antes do deploy, salve em
-- docs/runs/ o resultado de:
--   SELECT "B" AS "productId", count(*) FROM "_CategoryToProduct" GROUP BY 1 HAVING count(*) > 1;
--
-- O script roda como um unico lote (transacao implicita do Postgres): se qualquer passo
-- falhar, nada e aplicado. Os passos usam IF NOT EXISTS / ON CONFLICT / WHERE ... IS NULL
-- para tolerar uma reexecucao manual parcial.

-- 1. MeasurementUnit + unidade padrao (id fixo, referenciado pelos seeds).
CREATE TABLE IF NOT EXISTS "MeasurementUnit" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MeasurementUnit_abbreviation_key" ON "MeasurementUnit"("abbreviation");

INSERT INTO "MeasurementUnit" ("id", "name", "abbreviation", "active", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000101', 'Unidade', 'un', true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 2. Stock.unitId (obrigatorio) + um Stock de produto para todo produto que nao tem nenhum.
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "unitId" TEXT;

UPDATE "Stock"
SET "unitId" = '00000000-0000-4000-8000-000000000101'
WHERE "unitId" IS NULL;

-- "Stock"."productId" e UNIQUE: so cria para produtos sem nenhuma linha de Stock.
INSERT INTO "Stock" ("id", "productId", "variantId", "unitId", "availableQuantity", "reservedQuantity", "updatedAt")
SELECT gen_random_uuid()::text, p."id", NULL, '00000000-0000-4000-8000-000000000101', 0, 0, CURRENT_TIMESTAMP
FROM "Product" p
WHERE NOT EXISTS (SELECT 1 FROM "Stock" s WHERE s."productId" = p."id");

ALTER TABLE "Stock" ALTER COLUMN "unitId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Stock_unitId_idx" ON "Stock"("unitId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Stock_unitId_fkey') THEN
    ALTER TABLE "Stock" ADD CONSTRAINT "Stock_unitId_fkey"
      FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Product.categoryId: primeira categoria (menor createdAt, empate por slug).
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

DO $$
BEGIN
  IF to_regclass('"_CategoryToProduct"') IS NOT NULL THEN
    UPDATE "Product" p
    SET "categoryId" = first_category."categoryId"
    FROM (
      SELECT DISTINCT ON (cp."B") cp."B" AS "productId", c."id" AS "categoryId"
      FROM "_CategoryToProduct" cp
      JOIN "Category" c ON c."id" = cp."A"
      ORDER BY cp."B", c."createdAt", c."slug"
    ) AS first_category
    WHERE p."id" = first_category."productId"
      AND p."categoryId" IS NULL;
  END IF;
END $$;

-- 4. Fallback "Sem categoria" (ativa), criada/reaproveitada so se houver produto sem categoria.
INSERT INTO "Category" ("id", "name", "slug", "active", "updatedAt")
SELECT gen_random_uuid()::text, 'Sem categoria', 'sem-categoria', true, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Product" WHERE "categoryId" IS NULL)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Product"
SET "categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = 'sem-categoria')
WHERE "categoryId" IS NULL;

-- 5. Restricoes finais e remocao da tabela N:N implicita.
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Product_categoryId_fkey') THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS "_CategoryToProduct";
