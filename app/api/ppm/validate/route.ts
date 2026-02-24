export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
// 🔹 Motor PPM
import { runPpmEngine } from "@/core/ppm/ppmEngine";
// ✅ IMPORTAÇÃO DO CARREGADOR DE DEFEITOS (Já filtra PA no dataAdapter)
import { loadDefeitos } from "@/core/data/loadDefeitos";
// ✅ IMPORTAÇÃO DIRETA DO BUSCADOR DE OCORRÊNCIAS
import { fetchOcorrenciasFromSQL } from "@/core/data/dataAdapter";
// ✅ IMPORTAÇÃO DO CARREGADOR DE PRODUÇÃO
import { loadProductionRaw } from "@/core/ppm/ppmProductionNormalizer";

// eslint-disable-next-line no-console
console.log("🚨 API PPM VALIDATE CARREGADA");

// ======================================================
// GET /api/ppm/validate
// ======================================================

export async function GET() {
  try {
    // eslint-disable-next-line no-console
    console.log("🟢 [PPM-API] Iniciando validação de PPM");

    // --------------------------------------------------
    // 1️⃣ PRODUÇÃO
    // --------------------------------------------------
    const productionRaw = loadProductionRaw();

    // --------------------------------------------------
    // 2️⃣ DEFEITOS (KPI) & OCORRÊNCIAS (INFO)
    // --------------------------------------------------
    
    // Carrega em paralelo para ser mais rápido
    const [defectsRaw, occurrencesRaw] = await Promise.all([
        loadDefeitos(),            // Defeitos reais (sem AC, AN, etc)
        fetchOcorrenciasFromSQL()  // Apenas ocorrências (AC, AN, etc)
    ]);

    // eslint-disable-next-line no-console
    console.log(`📦 [PPM-API] Dados Carregados:`);
    console.log(`   - Produção: ${productionRaw.length}`);
    console.log(`   - Defeitos (KPI): ${defectsRaw.length}`);
    console.log(`   - Ocorrências (Info): ${occurrencesRaw.length}`);

    // --------------------------------------------------
    // 3️⃣ MOTOR PPM (Calcula KPI apenas com Defeitos)
    // --------------------------------------------------
    const result = runPpmEngine(
      productionRaw,
      defectsRaw
    );

    // --------------------------------------------------
    // 4️⃣ PROCESSAMENTO DE OCORRÊNCIAS (Manual)
    // --------------------------------------------------
    // O motor de PPM ignora ocorrências, então calculamos o breakdown aqui
    const occurrencesByCode: Record<string, number> = {};
    const occurrencesByCategory: Record<string, Record<string, number>> = {};

    occurrencesRaw.forEach((occ) => {
        // Normaliza o código para agrupar (ex: "AC " -> "AC")
        const code = String(occ["CÓDIGO DO FORNECEDOR"] || "N/A").trim().toUpperCase();
        const cat = occ.CATEGORIA || "GERAL";

        // Global
        occurrencesByCode[code] = (occurrencesByCode[code] || 0) + 1;

        // Por Categoria
        if (!occurrencesByCategory[cat]) {
            occurrencesByCategory[cat] = {};
        }
        occurrencesByCategory[cat][code] = (occurrencesByCategory[cat][code] || 0) + 1;
    });

    // --------------------------------------------------
    // 5️⃣ RESPONSE
    // --------------------------------------------------
    
    // Mesclamos o resultado do Motor PPM com os dados de Ocorrências
    const finalMeta = {
        ...result.meta,
        totalOccurrences: occurrencesRaw.length,
        occurrencesByCode,
        occurrencesByCategory,
        occurrencesList: occurrencesRaw // ✅ NOVA PROPRIEDADE: LISTA BRUTA PARA O MODAL
    };

    return NextResponse.json({
      ok: true,

      meta: finalMeta, 
      diagnostics: result.globalDiagnostics,

      rows: result.allRows,
      byCategory: result.byCategory,
    });

  } catch (error: any) {
    console.error("❌ [PPM-API] Erro crítico:", error);

    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}