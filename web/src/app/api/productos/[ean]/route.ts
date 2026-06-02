import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ean: string }> }
) {
  try {
    const { ean } = await params;

    const producto =
      await prisma.producto.findUnique({
        where: {
          id: ean,
        },

        include: {
          Categoria: true,

          HistorialPrecios: {
            orderBy: {
              fechaGuardado: 'asc',
            },
          },

          PreciosUnificados: {
            include: {
              Supermercado: true,
            },

            orderBy: {
              precio: 'asc',
            },
          },
        },
      });

    if (!producto) {
      return NextResponse.json(
        null,
        { status: 404 }
      );
    }

    const preciosAgrupados =
      producto.PreciosUnificados.reduce(
        (
            acc: Record<
            string,
            {
                supermercado: string;
                precios: {
                precio: number;
                sucursal: {
                    idSucursal: number;
                    nombre: string;
                    ubicacionMaps: string;
                };
                }[];
            }
            >,
            precio: any
        ) => {
          const nombreSuper =
            precio.Supermercado.nombre;

          if (!acc[nombreSuper]) {
            acc[nombreSuper] = {
              supermercado:
                nombreSuper,
              precios: [],
            };
          }

          acc[nombreSuper].precios.push({
            precio: precio.precio,

            sucursal: {
              idSucursal:
                Number(precio.id),

              nombre:
                nombreSuper,

              ubicacionMaps:
                'https://maps.google.com',
            },
          });

          return acc;
        },

        {} as Record<
          string,
          {
            supermercado: string;
            precios: {
              precio: number;
              sucursal: {
                idSucursal: number;
                nombre: string;
                ubicacionMaps: string;
              };
            }[];
          }
        >
      );

    return NextResponse.json({
      ean: producto.id,

      categoria:
        producto.Categoria.nombre,

      nombreProducto:
        producto.nombreProducto,

      marca:
        producto.marca,

      imagen:
        producto.imagen ?? undefined,

      historialPrecios:
        producto.HistorialPrecios.map(
        (
            h: {
            fechaGuardado: Date;
            precioPromedio: unknown;
            }
        ) => ({
            fecha:
              h.fechaGuardado
                .toISOString()
                .split('T')[0],

            precioPromedio:
              Number(
                h.precioPromedio
              ),
          })
        ),

      preciosPorSuper:
        Object.values(
          preciosAgrupados
        ),
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          'Error buscando producto',
      },
      {
        status: 500,
      }
    );
  }
}