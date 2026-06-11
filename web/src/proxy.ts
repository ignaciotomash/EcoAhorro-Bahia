import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_KEY_HEADER = 'x-internal-api-key';

const isInternalApiRoute = createRouteMatcher([
  '/api/productos',
  '/api/search(.*)',
  '/api/supermercados(.*)',
  '/api/carrito(.*)',
  '/api/admin(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/carrito(.*)',
  '/api/carrito(.*)',
]);

function apiError(code: string, message: string, status: number, details?: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

function isSameOriginBrowserRequest(req: NextRequest) {
  const secFetchSite = req.headers.get('sec-fetch-site');

  return secFetchSite === 'same-origin' || secFetchSite === 'same-site';
}

export default clerkMiddleware(async (auth, req) => {
  if (isInternalApiRoute(req)) {
    const internalApiKey = process.env.INTERNAL_API_KEY;

    if (!internalApiKey) {
      return apiError(
        'API_KEY_INTERNA_NO_CONFIGURADA',
        'La API key interna no esta configurada en el servidor.',
        503
      );
    }

    const requestApiKey = req.headers.get(INTERNAL_API_KEY_HEADER);
    const requestHeaders = new Headers(req.headers);

    if (requestApiKey !== internalApiKey) {
      // El frontend propio no expone la key: el proxy la agrega solo a requests same-origin.
      if (!isSameOriginBrowserRequest(req)) {
        return apiError(
          'API_KEY_INTERNA_INVALIDA',
          'La API interna requiere una API key valida.',
          401
        );
      }

      requestHeaders.set(INTERNAL_API_KEY_HEADER, internalApiKey);
    }

    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico)).*)',
    '/(api)(.*)',
  ],
};
