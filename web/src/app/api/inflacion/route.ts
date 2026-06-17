import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const API_BASE = 'https://api.argentinadatos.com/v1/finanzas/indices';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonWithCors(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
      ...init?.headers,
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

const fetchInflacion = unstable_cache(
  async () => {
    const [mensual, interanual] = await Promise.all([
      fetch(`${API_BASE}/inflacion`).then(r => r.json()),
      fetch(`${API_BASE}/inflacionInteranual`).then(r => r.json()),
    ]);
    return { mensual, interanual };
  },
  ['inflacion-argentinadatos'],
  { revalidate: 43200, tags: ['inflacion'] }
);

export async function GET() {
  try {
    const data = await fetchInflacion();
    return jsonWithCors(data);
  } catch (error) {
    console.error(error);
    return jsonWithCors(
      { error: 'No se pudo obtener la inflación.' },
      { status: 500 }
    );
  }
}
