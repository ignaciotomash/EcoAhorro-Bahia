/*
  Warnings:

  - You are about to drop the column `categoria` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `idCategoria` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentacion` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PreciosUnificados" DROP CONSTRAINT "PreciosUnificados_id_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "categoria",
ADD COLUMN     "idCategoria" INTEGER NOT NULL,
ADD COLUMN     "presentacion" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreciosUnificados" ADD CONSTRAINT "PreciosUnificados_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
