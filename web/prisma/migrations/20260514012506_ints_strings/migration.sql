/*
  Warnings:

  - The primary key for the `Carrito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HistorialPrecios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PreciosUnificados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Producto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sucursal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Supermercado` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CarritoPrecios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `precioDolar` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Carrito" DROP CONSTRAINT "Carrito_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPrecios" DROP CONSTRAINT "HistorialPrecios_id_fkey";

-- DropForeignKey
ALTER TABLE "PreciosUnificados" DROP CONSTRAINT "PreciosUnificados_idProducto_fkey";

-- DropForeignKey
ALTER TABLE "PreciosUnificados" DROP CONSTRAINT "PreciosUnificados_idSupermercado_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_idCategoria_fkey";

-- DropForeignKey
ALTER TABLE "Sucursal" DROP CONSTRAINT "Sucursal_supermercadoId_fkey";

-- DropForeignKey
ALTER TABLE "_CarritoPrecios" DROP CONSTRAINT "_CarritoPrecios_A_fkey";

-- DropForeignKey
ALTER TABLE "_CarritoPrecios" DROP CONSTRAINT "_CarritoPrecios_B_fkey";

-- DropForeignKey
ALTER TABLE "precioDolar" DROP CONSTRAINT "precioDolar_id_fkey";

-- AlterTable
ALTER TABLE "Carrito" DROP CONSTRAINT "Carrito_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Carrito_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Carrito_id_seq";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "HistorialPrecios" DROP CONSTRAINT "HistorialPrecios_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HistorialPrecios_pkey" PRIMARY KEY ("id", "fechaGuardado");

-- AlterTable
ALTER TABLE "PreciosUnificados" DROP CONSTRAINT "PreciosUnificados_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "idProducto" SET DATA TYPE TEXT,
ALTER COLUMN "idSupermercado" SET DATA TYPE TEXT,
ADD CONSTRAINT "PreciosUnificados_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PreciosUnificados_id_seq";

-- AlterTable
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "idCategoria" SET DATA TYPE TEXT,
ADD CONSTRAINT "Producto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sucursal" DROP CONSTRAINT "Sucursal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "supermercadoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Sucursal_id_seq";

-- AlterTable
ALTER TABLE "Supermercado" DROP CONSTRAINT "Supermercado_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Supermercado_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "telefono" SET DATA TYPE TEXT,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_CarritoPrecios" DROP CONSTRAINT "_CarritoPrecios_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_CarritoPrecios_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "precioDolar" DROP CONSTRAINT "precioDolar_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "precioDolar_pkey" PRIMARY KEY ("id", "fechaGuardado");

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
