/*
  Warnings:

  - You are about to drop the column `idCategoria` on the `Producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombreCategoria` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_idCategoria_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "idCategoria",
ADD COLUMN     "nombreCategoria" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_nombreCategoria_fkey" FOREIGN KEY ("nombreCategoria") REFERENCES "Categoria"("nombre") ON DELETE RESTRICT ON UPDATE CASCADE;
