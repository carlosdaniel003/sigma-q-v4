/* Legado Use Preferencialmente: C:\Users\cdaniel\Documents\sigma-q-v3\v3\app\api\knowledge\defects\v1\route.ts*/
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";
import { enrichDefeito } from "@/core/defeitos/defeitosEnrichment";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // "items" = registros brutos enviados pela produção
    const items = body.items || [];
    const opts = body.options || {
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true
    };

    // carrega catálogo oficial
    const catalogo = await loadCatalogo();

    // roda o motor de enriquecimento para cada item
    const enriched = [];

    for (const raw of items) {
      const result = await enrichDefeito(raw, opts, catalogo);
      enriched.push(result);
    }

    return NextResponse.json({
      ok: true,
      count: enriched.length,
      enriched
    });

  } catch (err) {
    console.error("CLASSIFY ERROR:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}