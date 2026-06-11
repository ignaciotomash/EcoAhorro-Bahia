-- Índices GIN para búsqueda fuzzy con pg_trgm
-- Ejecutar después de la migración de Prisma
-- Requiere: CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_producto_nombre_trgm
ON "Producto" USING gin (lower("nombreProducto") gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_producto_marca_trgm
ON "Producto" USING gin (lower("marca") gin_trgm_ops);
