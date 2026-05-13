/*
  Warnings:

  - You are about to drop the column `nombreCategoria` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `idCategoria` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_nombreCategoria_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "nombreCategoria",
ADD COLUMN     "idCategoria" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
