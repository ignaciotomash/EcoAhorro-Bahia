-- Disable statement timeout for this session (Supabase default is too short)
SET statement_timeout = 0;

-- Drop FK constraint before dropping the column
ALTER TABLE "precioDolar" DROP CONSTRAINT "precioDolar_id_fkey";

-- Drop id column (0 rows, no data loss)
ALTER TABLE "precioDolar" DROP COLUMN "id";

-- Align fechaGuardado type with Prisma DateTime (timestamp without tz)
ALTER TABLE "precioDolar" ALTER COLUMN "fechaGuardado" TYPE timestamp(3) without time zone;

-- Align precioPromedio from numeric to double precision (Float in Prisma)
ALTER TABLE "precioDolar" ALTER COLUMN "precioPromedio" TYPE double precision;

-- Sync Usuario columns back to NOT NULL (already NOT NULL in Supabase)
ALTER TABLE "Usuario" ALTER COLUMN "nombreUsuario" SET NOT NULL;
ALTER TABLE "Usuario" ALTER COLUMN "telefono" SET NOT NULL;
