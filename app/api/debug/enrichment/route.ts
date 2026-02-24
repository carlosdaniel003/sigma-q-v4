// app/api/debug/enrichment/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadDefeitosAll } from "@/core/defeitos/defeitosLoader";
import { enrichDefeito } from "@/core/defeitos/defeitosEnrichment";

export async function GET() {
  try {
    const loaded = await loadDefeitosAll({});
    const sample = loaded.todas.slice(0, 5);

    const opts = {
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true
    };

    const enriched = [];

    for (const r of sample) {
      enriched.push(await enrichDefeito(r, opts));
    }

    return NextResponse.json({ ok: true, enriched });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}