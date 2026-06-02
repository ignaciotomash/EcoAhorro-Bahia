-- CreateTable
CREATE TABLE "Carrito" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecios" (
    "id" BIGINT NOT NULL,
    "fechaGuardado" TIMESTAMP(3) NOT NULL,
    "precioPromedio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "HistorialPrecios_pkey" PRIMARY KEY ("id","fechaGuardado")
);

-- CreateTable
CREATE TABLE "PreciosUnificados" (
    "id" BIGSERIAL NOT NULL,
    "idProducto" BIGINT NOT NULL,
    "idSupermercado" INTEGER NOT NULL,
    "precio" REAL NOT NULL,
    "actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreciosUnificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" BIGINT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "imagen" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "supermercadoId" INTEGER NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supermercado" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Supermercado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precioDolar" (
    "id" BIGINT NOT NULL,
    "fechaGuardado" TIMESTAMP(3) NOT NULL,
    "precioPromedio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "precioDolar_pkey" PRIMARY KEY ("id","fechaGuardado")
);

-- CreateTable
CREATE TABLE "_CarritoPrecios" (
    "A" INTEGER NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_CarritoPrecios_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrito_usuarioId_key" ON "Carrito"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Supermercado_nombre_key" ON "Supermercado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE INDEX "_CarritoPrecios_B_index" ON "_CarritoPrecios"("B");

-- AddForeignKey
ALTER TABLE "Carrito" ADD CONSTRAINT "Carrito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecios" ADD CONSTRAINT "HistorialPrecios_id_fkey" FOREIGN KEY ("id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreciosUnificados" ADD CONSTRAINT "PreciosUnificados_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreciosUnificados" ADD CONSTRAINT "PreciosUnificados_idSupermercado_fkey" FOREIGN KEY ("idSupermercado") REFERENCES "Supermercado"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sucursal" ADD CONSTRAINT "Sucursal_supermercadoId_fkey" FOREIGN KEY ("supermercadoId") REFERENCES "Supermercado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precioDolar" ADD CONSTRAINT "precioDolar_id_fkey" FOREIGN KEY ("id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarritoPrecios" ADD CONSTRAINT "_CarritoPrecios_A_fkey" FOREIGN KEY ("A") REFERENCES "Carrito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarritoPrecios" ADD CONSTRAINT "_CarritoPrecios_B_fkey" FOREIGN KEY ("B") REFERENCES "PreciosUnificados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
