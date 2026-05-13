/*
  Warnings:

  - You are about to drop the column `sucursales` on the `Supermercado` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Supermercado" DROP COLUMN "sucursales";

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

-- AddForeignKey
ALTER TABLE "Sucursal" ADD CONSTRAINT "Sucursal_supermercadoId_fkey" FOREIGN KEY ("supermercadoId") REFERENCES "Supermercado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
