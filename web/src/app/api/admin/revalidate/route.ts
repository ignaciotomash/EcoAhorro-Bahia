import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TAGS = ['productos', 'categorias', 'supermercados'] as const;

function apiError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

export async function POST(request: NextRequest) {
  const internalApiKey = process.env.INTERNAL_API_KEY;

  if (!internalApiKey) {
    return apiError('API key interna no configurada en el servidor.', 503);
  }

  const requestKey = request.headers.get('x-internal-api-key');

  if (requestKey !== internalApiKey) {
    return apiError('API key interna inválida.', 401);
  }

  try {
    const body = await request.json();
    const tags: string[] = [];

    if (body.tag === 'all') {
      tags.push(...VALID_TAGS);
    } else if (body.tag && typeof body.tag === 'string') {
      tags.push(body.tag);
    } else if (Array.isArray(body.tags)) {
      tags.push(...body.tags);
    }

    if (tags.length === 0) {
      return apiError(
        'Debe especificar un tag válido en el body: { tag: string } | { tags: string[] } | { tag: "all" }.',
        400
      );
    }

    const invalidTags = tags.filter((t) => !VALID_TAGS.includes(t as any));
    if (invalidTags.length > 0) {
      return apiError(
        `Tags inválidos: ${invalidTags.join(', ')}. Válidos: ${VALID_TAGS.join(', ')}.`,
        400
      );
    }

    tags.forEach((tag) => revalidateTag(tag, 'max'));

    return NextResponse.json({
      revalidated: true,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiError('Body inválido. Envíe JSON con { tag: string } o { tags: string[] }.', 400);
  }
}
