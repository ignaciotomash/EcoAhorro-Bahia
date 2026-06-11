-- Replace the previous cart-to-price relation with explicit product items.
DROP TABLE IF EXISTS "_CarritoPrecios";

-- Allow Clerk users without optional profile fields.
ALTER TABLE "Usuario"
ALTER COLUMN "nombreUsuario" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

CREATE TABLE "CarritoItem" (
  "carritoId" TEXT NOT NULL,
  "idProducto" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT "CarritoItem_pkey" PRIMARY KEY ("carritoId", "idProducto")
);

ALTER TABLE "CarritoItem"
ADD CONSTRAINT "CarritoItem_carritoId_fkey"
FOREIGN KEY ("carritoId") REFERENCES "Carrito"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CarritoItem"
ADD CONSTRAINT "CarritoItem_idProducto_fkey"
FOREIGN KEY ("idProducto") REFERENCES "Producto"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
