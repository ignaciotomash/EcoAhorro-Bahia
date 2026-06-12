-- Add indexes for foreign keys and commonly queried columns

CREATE INDEX "Producto_idCategoria_idx" ON "Producto"("idCategoria");

CREATE INDEX "Sucursal_supermercadoId_idx" ON "Sucursal"("supermercadoId");

CREATE INDEX "HistorialPrecios_id_idx" ON "HistorialPrecios"("id");

CREATE INDEX "PreciosUnificados_idProducto_idx" ON "PreciosUnificados"("idProducto");

CREATE INDEX "PreciosUnificados_idSupermercado_idx" ON "PreciosUnificados"("idSupermercado");

CREATE INDEX "PreciosUnificados_precio_idx" ON "PreciosUnificados"("precio");
