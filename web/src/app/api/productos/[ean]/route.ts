import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function apiError(
  code: string,
  message: string,
  details?: string
) {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

function jsonWithCors(
  body: unknown,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers,
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

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
      return jsonWithCors(
        apiError(
          'PRODUCTO_NO_ENCONTRADO',
          'No se encontro un producto con el EAN indicado.',
          `EAN: ${ean}`
        ),
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
            precio
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

    return jsonWithCors({
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
                .toISOString(),

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

    return jsonWithCors(
      apiError(
        'ERROR_BUSCANDO_PRODUCTO',
        'No se pudo obtener el producto solicitado.'
      ),
      {
        status: 500,
      }
    );
  }
}
