-- ===========================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- Ejecutar directamente en PostgreSQL
-- (Supabase SQL Editor, pgAdmin, psql, etc.)
-- ===========================================

-- Índice para la FK más usada: JOIN entre Producto y PreciosUnificados
-- Impacto: ALTO - cada consulta de catálogo hace este JOIN
CREATE INDEX IF NOT EXISTS idx_precios_unificados_id_producto 
  ON "PreciosUnificados"("idProducto");

-- Índice para filtrar por supermercado en la relación
CREATE INDEX IF NOT EXISTS idx_precios_unificados_id_supermercado 
  ON "PreciosUnificados"("idSupermercado");

-- Índice para filtrar productos por categoría
-- Impacto: ALTO - usado cada vez que se filtra por categoría
CREATE INDEX IF NOT EXISTS idx_producto_id_categoria 
  ON "Producto"("idCategoria");

-- Índice para búsqueda por nombre de producto (ILIKE)
-- Impacto: MEDIO - usado en la barra de búsqueda
CREATE INDEX IF NOT EXISTS idx_producto_nombre_lower
  ON "Producto"(LOWER("nombreProducto") text_pattern_ops);

-- Verificar que se crearon correctamente:
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename IN ('PreciosUnificados', 'Producto') 
-- AND indexname LIKE 'idx_%';
