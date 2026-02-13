// app/api/validacao/auditoria-defeitos/route.ts
import { NextResponse } from "next/server";
import { loadDefeitos } from "@/core/data/loadDefeitos";
import { auditarNaoClassificados } from "@/core/data/loadAgrupamento";
import { norm } from "@/core/diagnostico/diagnosticoUtils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fonteParam = searchParams.get("fonte") || "todas";
    const fonteNorm = norm(fonteParam);

    // 1. Carrega a base completa de defeitos do SQL
    let defeitosRaw = await loadDefeitos();

    // 2. Aplica o filtro de Categoria/Fonte se não for a aba "todas"
    // ✅ CORREÇÃO: Agora garantimos que o sistema entenda tanto "todas" (minúsculo) quanto "TODAS" (maiúsculo)
    if (fonteParam.toLowerCase() !== "todas" && fonteNorm !== "TODAS") {
      defeitosRaw = defeitosRaw.filter((d: any) => {
        // Verifica categoria do produto ou área (PA, etc) para bater com a sidebar
        const itemCat = norm(d.CATEGORIA || d.AREA || d.fonte || "");
        return itemCat === fonteNorm;
      });
    }

    // 3. Executa a inteligência de auditoria
    const resultado = auditarNaoClassificados(defeitosRaw);

    return NextResponse.json({ auditoria: resultado });
  } catch (error: any) {
    console.error("❌ Erro na API de Auditoria de Defeitos:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error.message },
      { status: 500 }
    );
  }
}