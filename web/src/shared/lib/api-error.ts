import { NextResponse } from 'next/server';

export function apiError(code: string, message: string, details?: string) {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

export function apiErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: string
) {
  return NextResponse.json(apiError(code, message, details), { status });
}
