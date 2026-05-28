// src/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { resolverBusqueda } from "@/lib/semanticResolver";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Ingresá al menos 2 caracteres para buscar." },
      { status: 400 }
    );
  }

  try {
    const productos = await resolverBusqueda(query);

    return NextResponse.json({
      query,
      total: productos.length,
      resultados: productos,
    });
  } catch (error) {
    console.error("[search] Error:", error);
    return NextResponse.json(
      { error: "Error interno al buscar productos." },
      { status: 500 }
    );
  }
}
