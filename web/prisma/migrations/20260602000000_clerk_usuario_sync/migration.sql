-- Allow Clerk users without profile fields that are optional in Clerk.
ALTER TABLE "Usuario"
ALTER COLUMN "nombreUsuario" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;
