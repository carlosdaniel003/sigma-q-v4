// app/api/defeitos/status/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";
import { loadDefeitosAll } from "@/core/defeitos/defeitosLoader";

export async function GET() {
  try {
    const cat = await loadCatalogo();
    const defs = await loadDefeitosAll({
      usarCodigos: false,
      usarFalhas: false,
      usarResponsabilidades: false
    });

    const catalog = {
      codigos: cat.codigos.length,
      falhas: cat.falhas.length,
      responsabilidades: cat.responsabilidades.length
    };

    const totals = {
      af: defs.af.length,
      lcm: defs.lcm.length,
      produto: defs.produto.length,
      pth: defs.pth.length,
      todas: defs.todas.length
    };

    return NextResponse.json({
      ok: true,
      catalog,
      totals
    });
  } catch (err: any) {
    console.error("Erro /status:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}