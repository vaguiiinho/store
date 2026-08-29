-- Converte identificadores legados (CUIDs e IDs semanticos do seed) preservando
-- relacionamentos; as FKs da migration inicial usam ON UPDATE CASCADE.
UPDATE "Category" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Product" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Variant" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Stock" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Customer" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Address" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Cart" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "CartItem" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Order" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "OrderItem" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE "Payment" SET "id" = gen_random_uuid()::text WHERE "id" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Product" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Variant" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Stock" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Cart" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CartItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "OrderItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Payment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
