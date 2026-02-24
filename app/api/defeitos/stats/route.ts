// app/api/defeitos/stats/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";
import { auditarNaoClassificados } from "@/core/data/loadAgrupamento"; 
// ✅ A PEÇA QUE FALTAVA: Importando o normalizador oficial!
import { norm } from "@/core/diagnostico/diagnosticoUtils";

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
  if (s.includes("fmea") || s.includes("classificado") || s.includes("agrupamento")) return "falhas"; 
  return "outros";
}

// --------------------------------------------------
// REGRA OFICIAL DO SIGMA-Q (BLINDADA COM NORM)
// --------------------------------------------------
function isIdentified(r: any, naoClassificadosSet: Set<string>): boolean {
  const hasIssues = Array.isArray(r._issues) && r._issues.length > 0;
  // ✅ CORREÇÃO CRÍTICA: norm() garante que acentos não causem fuga de dados
  const isFmeaOrphan = naoClassificadosSet.has(norm(r.ANALISE));
  
  return !hasIssues && !isFmeaOrphan;
}

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

    if (!catalogos.usarCodigos && !catalogos.usarFalhas && !catalogos.usarResponsabilidades) {
      return NextResponse.json(
        { ok: false, error: "KPI inválido: nenhuma regra de validação ativa." },
        { status: 400 }
      );
    }

    const cache = await getDefeitosCache(catalogos);
    const lista = fonteParam === "todas" ? cache.enriched : (cache as any)[fonteParam] || [];

    // =========================================================
    // 📊 INTEGRAÇÃO COM AUDITORIA FMEA
    // =========================================================
    const auditoriaFmea = auditarNaoClassificados(lista);
    
    // ✅ Garante que o Set usa apenas chaves super normalizadas
    const setNaoClassificados = new Set(auditoriaFmea.lista.map(i => norm(i.analise)));

    const totalItems = lista.length;

    // SOMA DO VOLUME TOTAL
    const totalDefeitos = lista.reduce((acc, r) => {
      const v = Number(r["QUANTIDADE"] ?? r.quantidade ?? 1); 
      return acc + (isFinite(v) ? v : 1);
    }, 0);

    // VOLUME IDENTIFICADO (Usando a regra blindada)
    const identifiedVolume = lista.filter(r => isIdentified(r, setNaoClassificados))
      .reduce((acc, r) => {
        const v = Number(r["QUANTIDADE"] ?? r.quantidade ?? 1);
        return acc + (isFinite(v) ? v : 1);
      }, 0);

    // O "notIdentified" agora vai cravar perfeitamente com a tabela
    const notIdentified = totalDefeitos - identifiedVolume;

    const percentIdentified = totalDefeitos > 0
      ? Number(((identifiedVolume / totalDefeitos) * 100).toFixed(2))
      : 100;

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
      if (isIdentified(r, setNaoClassificados)) continue;

      // ✅ Usamos norm() aqui também para evitar fuga na injeção da tag
      const analiseNorm = norm(r.ANALISE);
      const isFmeaIssue = setNaoClassificados.has(analiseNorm);
      
      const issues = [...(r._issues || [])];
      if (isFmeaIssue) issues.push("Falha Sem Agrupamento FMEA");

      if (issues.length === 0) issues.push("Inconsistência Desconhecida");

      const qtdLinha = Number(r["QUANTIDADE"] ?? r.quantidade ?? 1);
      const volumeLinha = isFinite(qtdLinha) ? qtdLinha : 1;

      const catsNaLinha = issues.map(issueCategoryKey);

      let categoriaPrincipal = "outros";
      
      if (catsNaLinha.includes("modelos")) {
        categoriaPrincipal = "modelos";
      } else if (catsNaLinha.includes("falhas")) {
        categoriaPrincipal = "falhas";
      } else if (catsNaLinha.includes("responsabilidades")) {
        categoriaPrincipal = "responsabilidades";
      } else if (catsNaLinha.includes("naoMostrar")) {
        categoriaPrincipal = "naoMostrar";
      }

      notIdentifiedBreakdown[categoriaPrincipal] += volumeLinha;
      issuesSummary[categoriaPrincipal].count += volumeLinha;

      for (const issue of issues) {
        divergencias[issue] = (divergencias[issue] || 0) + volumeLinha;
      }

      if (issuesSummary[categoriaPrincipal].examples.length < 20) {
        issuesSummary[categoriaPrincipal].examples.push({
          fonte: r.fonte,
          categoria: r.CATEGORIA || r.categoria,
          MODELO: r.MODELO,
          CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"],
          _issues: issues, 
        });
      }
    }

    // --------------------------------------------------
    // KPI por Categoria (Abas Laterais)
    // --------------------------------------------------
    function computeMetrics(arr: any[]) {
      const safeArr = arr || [];
      const tItems = safeArr.length;
      
      const tDef = safeArr.reduce((a, b) => a + (Number(b["QUANTIDADE"] ?? b.quantidade ?? 1) || 1), 0);
      
      const idVolume = safeArr.filter(r => isIdentified(r, setNaoClassificados))
        .reduce((a, b) => a + (Number(b["QUANTIDADE"] ?? b.quantidade ?? 1) || 1), 0);
      
      return {
        total: tItems,
        totalDefeitos: tDef,
        identified: idVolume, 
        notIdentified: tDef - idVolume, 
        percentIdentified: tDef > 0 ? Number(((idVolume / tDef) * 100).toFixed(2)) : 100,
      };
    }

    const dynamicKeys = Object.keys(cache).filter(k => k !== 'enriched');
    const perBase: Record<string, any> = {
        todas: computeMetrics(cache.enriched)
    };

    dynamicKeys.forEach(key => {
        const cleanKey = key.toLowerCase().trim();
        let displayKey = key;
        if (cleanKey === 'n/a' || cleanKey === 'null' || cleanKey === 'undefined' || cleanKey === '') {
            displayKey = "SEM CATEGORIA";
        }
        perBase[displayKey] = computeMetrics((cache as any)[key]);
    });

    return NextResponse.json({
      ok: true,
      totalItems,
      totalDefeitos,
      identified: identifiedVolume, 
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