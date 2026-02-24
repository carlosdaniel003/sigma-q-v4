// app/api/defeitos/preview/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

type CatalogosFlags = {
  usarCodigos?: boolean;
  usarFalhas?: boolean;
  usarResponsabilidades?: boolean;
};

// Classifica issue em categoria para métricas
function issueCategoryKey(issue: string) {
  const s = String(issue || "").toLowerCase();
  if (s.includes("modelo")) return "modelos";
  if (s.includes("falha")) return "falhas";
  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";
  if (s.includes("codigo") && !s.includes("falha")) return "modelos";
  return "outros";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const fonte = (url.searchParams.get("fonte") || "todas").toUpperCase();
    const limit = Number(url.searchParams.get("limit") || 30);
    const offset = Number(url.searchParams.get("offset") || 0);

    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const catalogos: CatalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades")
    };

    // ⚡ Pega do cache (SEM reprocessamento)
    const cache = await getDefeitosCache(catalogos);

    // Seleciona lista
    const lista =
      fonte === "TODAS"
        ? cache.enriched
        : (cache as any)[fonte.toLowerCase()] ?? [];

    // =====================================================
    // 🔥 MÉTRICAS GERAIS
    // =====================================================

    const totalItems = lista.length;

    const totalDefeitos = lista.reduce((acc, r) => {
      const v = Number(r["QUANTIDADE"] ?? r.QUANTIDADE ?? r["Quantidade"] ?? 0);
      return acc + (isFinite(v) ? v : 0);
    }, 0);

    const identified = lista.filter(r => (r._issues || []).length === 0).length;
    const notIdentified = totalItems - identified;

    const avgConfidence =
      totalItems
        ? Number(
            (
              lista.reduce((a, b) => a + (Number(b._confidence) || 0), 0) /
              totalItems
            ).toFixed(4)
          )
        : 0;

    const percentFullMatch = totalItems
      ? Number(((identified / totalItems) * 100).toFixed(2))
      : 0;

    const percentBelowThreshold = totalItems
      ? Number(((notIdentified / totalItems) * 100).toFixed(2))
      : 0;

    // =====================================================
    // 🔥 BREAKDOWN DETALHADO (NÃO IDENTIFICADOS)
    // =====================================================

    const breakdown = {
      modelos: 0,
      falhas: 0,
      responsabilidades: 0,
      naoMostrar: 0,
      outros: 0
    };

    const examplesLimit = 12;

    const breakdownExamples: Record<string, any[]> = {
      modelos: [],
      falhas: [],
      responsabilidades: [],
      naoMostrar: [],
      outros: []
    };

    for (const r of lista) {
      const issues = r._issues || [];
      if (issues.length === 0) continue;

      const cats = new Set<string>();
      for (const issue of issues) cats.add(issueCategoryKey(issue));

      if (cats.size === 0) cats.add("outros");

      for (const c of cats) {
        breakdown[c]++;

        if (breakdownExamples[c].length < examplesLimit) {
          breakdownExamples[c].push({
            fonte: r.fonte,
            MODELO: r.MODELO ?? null,
            CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"] ?? null,
            QUANTIDADE: r["QUANTIDADE"] ?? 0,
            _confidence: r._confidence,
            _issues: r._issues
          });
        }
      }
    }

    // =====================================================
    // 🔥 PAGINAÇÃO
    // =====================================================

    const pageSample = lista.slice(offset, offset + limit);

    // =====================================================
    // 🔥 RESPOSTA FINAL
    // =====================================================

    return NextResponse.json({
      ok: true,
      globalTotals: {
        totalItems,
        totalDefeitos,
        identified,
        notIdentified
      },
      pageStats: {
        avgConfidence,
        percentFullMatch,
        percentBelowThreshold,
        breakdown,
        breakdownExamples
      },
      sample: pageSample
    });

  } catch (err: any) {
    console.error("preview error", err);
    return NextResponse.json(
      {
        ok: false,
        error: String(err)
      },
      { status: 500 }
    );
  }
}