// app/api/defeitos/stats/route.ts
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

type CatalogosFlags = {
  usarCodigos?: boolean;
  usarFalhas?: boolean;
  usarResponsabilidades?: boolean;
};

// --------------------------------------------------
// Classificador de issues
// --------------------------------------------------
function issueCategoryKey(issue: string) {
  const s = String(issue || "").toLowerCase();
  if (s.includes("modelo")) return "modelos";
  if (s.includes("falha")) return "falhas";
  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";
  if (s.includes("codigo") && !s.includes("falha")) return "modelos";
  return "outros";
}

// --------------------------------------------------
// REGRA OFICIAL DO SIGMA-Q
// --------------------------------------------------
function isIdentified(r: any): boolean {
  return Array.isArray(r._issues) && r._issues.length === 0;
}

// --------------------------------------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fonteParam = (url.searchParams.get("fonte") || "todas").toLowerCase().trim();

    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const catalogos: CatalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades"),
    };

    if (
      !catalogos.usarCodigos &&
      !catalogos.usarFalhas &&
      !catalogos.usarResponsabilidades
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "KPI inválido: nenhuma regra de validação ativa.",
        },
        { status: 400 }
      );
    }

    const cache = await getDefeitosCache(catalogos);

    // Seleção dinâmica da lista
    const lista =
      fonteParam === "todas"
        ? cache.enriched
        : (cache as any)[fonteParam] || [];

    const totalItems = lista.length;

    // =========================================================
    // 📊 LOGS DE AUDITORIA (Para bater a conta)
    // =========================================================
    const totalDefeitos = lista.reduce((acc, r) => {
      const v = Number(r["QUANTIDADE"] ?? r.QUANTIDADE ?? 0);
      return acc + (isFinite(v) ? v : 0);
    }, 0);

    if (fonteParam === 'todas') {
        console.log(`📊 [AUDITORIA] Registros (Linhas SQL): ${totalItems}`);
        console.log(`📊 [AUDITORIA] Defeitos (Soma Qtd):   ${totalDefeitos}`);
    }

    const identified = lista.filter(isIdentified).length;
    const notIdentified = totalItems - identified;

    const percentIdentified = totalItems
      ? Number(((identified / totalItems) * 100).toFixed(2))
      : 0;

    // --------------------------------------------------
    // Breakdown de não identificados
    // --------------------------------------------------
    const notIdentifiedBreakdown: any = {
      modelos: 0,
      falhas: 0,
      responsabilidades: 0,
      naoMostrar: 0,
      outros: 0,
    };

    const issuesSummary: any = {
      modelos: { count: 0, examples: [] },
      falhas: { count: 0, examples: [] },
      responsabilidades: { count: 0, examples: [] },
      naoMostrar: { count: 0, examples: [] },
      outros: { count: 0, examples: [] },
    };

    const divergencias: Record<string, number> = {};

    for (const r of lista) {
      if (isIdentified(r)) continue;

      const issues = r._issues || [];
      const cats = new Set<string>();

      for (const issue of issues) {
        divergencias[issue] = (divergencias[issue] || 0) + 1;
        cats.add(issueCategoryKey(issue));
      }

      if (cats.size === 0) {
        notIdentifiedBreakdown.outros++;
        continue;
      }

      for (const c of cats) {
        if (c in notIdentifiedBreakdown) {
          notIdentifiedBreakdown[c]++;
          issuesSummary[c].count++;

          if (issuesSummary[c].examples.length < 20) {
            issuesSummary[c].examples.push({
              fonte: r.fonte,
              categoria: r.CATEGORIA || r.categoria,
              MODELO: r.MODELO,
              CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"],
              _issues: r._issues,
            });
          }
        }
      }
    }

    // --------------------------------------------------
    // KPI por Categoria
    // --------------------------------------------------
    function computeMetrics(arr: any[]) {
      const safeArr = arr || [];
      const total = safeArr.length;
      const totalDef = safeArr.reduce(
        (a, b) => a + (Number(b["QUANTIDADE"]) || 0),
        0
      );
      const ident = safeArr.filter(isIdentified).length;
      
      return {
        total,
        totalDefeitos: totalDef,
        identified: ident,
        notIdentified: total - ident,
        percentIdentified: total
          ? Number(((ident / total) * 100).toFixed(2))
          : 0,
      };
    }

    // 🌟 GERAÇÃO DINÂMICA (MOSTRANDO SEM CATEGORIA)
    const dynamicKeys = Object.keys(cache).filter(k => k !== 'enriched');
    
    const perBase: Record<string, any> = {
        todas: computeMetrics(cache.enriched)
    };

    dynamicKeys.forEach(key => {
        // Normaliza a chave para verificação
        const cleanKey = key.toLowerCase().trim();
        
        // Se for uma chave "vazia", renomeamos para "SEM CATEGORIA" para aparecer na tela
        let displayKey = key;
        if (cleanKey === 'n/a' || cleanKey === 'null' || cleanKey === 'undefined' || cleanKey === '') {
            displayKey = "SEM CATEGORIA";
            console.log(`⚠️ [ALERTA] Encontrados ${cache[key]?.length} registros órfãos (N/A) -> Movidos para "SEM CATEGORIA"`);
        }

        // Se já existe (caso tenha n/a e null separados), soma ou sobrescreve. 
        // Aqui vamos simplificar e assumir um único bucket.
        perBase[displayKey] = computeMetrics((cache as any)[key]);
    });

    return NextResponse.json({
      ok: true,
      totalItems,
      totalDefeitos,
      identified,
      notIdentified,
      percentIdentified,
      notIdentifiedBreakdown,
      issuesSummary,
      divergencias,
      perBase, 
    });

  } catch (err: any) {
    console.error("stats error", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}