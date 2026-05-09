-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "imagen" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supermercado" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "sucursales" INTEGER NOT NULL,

    CONSTRAINT "Supermercado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecios" (
    "id" INTEGER NOT NULL,
    "fechaGuardado" TIMESTAMP(3) NOT NULL,
    "precioPromedio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "HistorialPrecios_pkey" PRIMARY KEY ("id","fechaGuardado")
);

-- CreateTable
CREATE TABLE "precioDolar" (
    "id" INTEGER NOT NULL,
    "fechaGuardado" TIMESTAMP(3) NOT NULL,
    "precioPromedio" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "precioDolar_pkey" PRIMARY KEY ("id","fechaGuardado")
);

-- CreateTable
CREATE TABLE "PreciosUnificados" (
    "id" SERIAL NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "nombreSuper" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreciosUnificados_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Carrito" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarritoPrecios" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CarritoPrecios_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supermercado_nombre_key" ON "Supermercado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Carrito_usuarioId_key" ON "Carrito"("usuarioId");

-- CreateIndex
CREATE INDEX "_CarritoPrecios_B_index" ON "_CarritoPrecios"("B");

-- AddForeignKey
ALTER TABLE "HistorialPrecios" ADD CONSTRAINT "HistorialPrecios_id_fkey" FOREIGN KEY ("id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precioDolar" ADD CONSTRAINT "precioDolar_id_fkey" FOREIGN KEY ("id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreciosUnificados" ADD CONSTRAINT "PreciosUnificados_id_fkey" FOREIGN KEY ("id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreciosUnificados" ADD CONSTRAINT "PreciosUnificados_nombreSuper_fkey" FOREIGN KEY ("nombreSuper") REFERENCES "Supermercado"("nombre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrito" ADD CONSTRAINT "Carrito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarritoPrecios" ADD CONSTRAINT "_CarritoPrecios_A_fkey" FOREIGN KEY ("A") REFERENCES "Carrito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarritoPrecios" ADD CONSTRAINT "_CarritoPrecios_B_fkey" FOREIGN KEY ("B") REFERENCES "PreciosUnificados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
