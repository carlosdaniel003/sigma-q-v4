import { NextRequest, NextResponse } from "next/server";
import { loadProductionRaw } from "@/core/ppm/ppmProductionNormalizer";
import { loadDefeitos } from "@/core/data/loadDefeitos";

import { runPpmEngine } from "@/core/ppm/ppmEngine";
import { calculatePpmMonthlyTrend } from "@/core/ppm/ppmMonthlyTrend";
import { calculateResponsabilidadeMensal } from "@/core/ppm/ppmResponsabilidadeMensal";
import { calculateCategoriaMensal } from "@/core/ppm/ppmCategoriaMensal";
import { calculateTrendHierarchy } from "@/core/dashboard/dashboardTrendEngine";
import { calculateCausesRanking } from "@/core/dashboard/dashboardCausesEngine";
import { calculateDetailsRanking } from "@/core/dashboard/dashboardDetailsEngine";

// ✅ LISTA REAL DE CÓDIGOS DE OCORRÊNCIA (Baseada no seu sigmaTranslations.ts)
const CODIGOS_OCORRENCIA_CHECK = [
  "A", "RC", "AF RET", "FF", "VER", "INT MOD", 
  "RT", "OC", "AN", "AC"
];

function norm(val: any) {
  return String(val ?? "").trim().toUpperCase();
}

function normalizeTurno(val: any): string {
    if (!val) return "";
    const v = norm(val);
    if (v === "C" || v === "COMERCIAL" || v === "ADM") return "COMERCIAL";
    if (v === "BC" || v === "2" || v === "2º" || v.includes("2º TURNO") || v.includes("2 TURNO")) return "2º TURNO";
    if (v === "A" || v === "1" || v === "1º" || v.includes("1º TURNO") || v.includes("1 TURNO")) return "1º TURNO";
    if (v === "3" || v === "3º" || v.includes("3º TURNO")) return "3º TURNO";
    return v; 
}

function parseDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
        return new Date(Math.round((val - 25569) * 86400 * 1000) + (12 * 3600 * 1000));
    }
    if (typeof val === 'string') {
        const matchBr = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (matchBr) {
             return new Date(parseInt(matchBr[3]), parseInt(matchBr[2])-1, parseInt(matchBr[1]), 12, 0, 0);
        }
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}

function extractDateIso(val: any): string | null {
    const d = parseDate(val);
    return d ? d.toISOString().split('T')[0] : null;
}

function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

function matchResponsabilidade(itemResp: string, filtros: string[]): boolean {
    if (!itemResp) return false;
    const resp = norm(itemResp);
    return filtros.some(filtro => {
        const f = norm(filtro);
        if (f === "AGRUPAMENTO DE PROCESSOS" || f === "TODOS OS PROCESSOS") {
            return resp.startsWith("PROC") || resp.includes("PROCESSO") || resp.includes("PTH") || resp.includes("LCM");
        }
        if (f === "AGRUPAMENTO DE FORNECEDORES" || f === "TODOS OS FORNECEDORES") {
            return resp.includes("FORN") || resp === "F" || resp === "FL";
        }
        return resp === f;
    });
}

// ✅ HELPER: Identifica se é Ocorrência usando a lista correta
function checkIsOcorrencia(row: any): boolean {
    // Verifica diferentes campos onde o código pode estar
    const cod1 = norm(row["CÓDIGO DO FORNECEDOR"] || "");
    const cod2 = norm(row.CODIGO_MOTIVO || "");
    const cod3 = norm(row.cod_mot || "");
    
    // Verifica se algum dos códigos bate com a lista de ocorrências
    if (CODIGOS_OCORRENCIA_CHECK.some(c => c === cod1 || c === cod2 || c === cod3)) {
        return true;
    }
    
    // Fallback: Nome (caso legado)
    const resp = norm(row.RESPONSABILIDADE || row.Responsabilidade || "");
    if (resp.includes("OCORRENCIA") || resp.includes("OCORRÊNCIA")) return true;

    return false;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getMultiFilter = (key: string) => {
        const allValues = searchParams.getAll(key);
        if (!allValues || allValues.length === 0) return null;
        const flatValues = allValues.flatMap(v => v.split(','));
        const cleanValues = flatValues.map(v => norm(v)).filter(v => v && v !== "TODOS");
        return cleanValues.length > 0 ? cleanValues : null;
    };

    const filterCategoria = getMultiFilter("categoria");
    const filterModelo = getMultiFilter("modelo");
    const filterResponsabilidade = getMultiFilter("responsabilidade"); 
    let filterTurnoRaw = getMultiFilter("turno");
    let filterTurno: string[] | null = null;
    if (filterTurnoRaw) {
        filterTurno = filterTurnoRaw.map(t => normalizeTurno(t));
    }

    const filterDia = searchParams.get("dia");
    const filterMes = searchParams.get("mes") ? parseInt(searchParams.get("mes")!) : null;
    const filterAno = searchParams.get("ano") ? parseInt(searchParams.get("ano")!) : null;
    const filterSemana = searchParams.get("semana") ? parseInt(searchParams.get("semana")!) : null;

    let productionRaw = loadProductionRaw(); 
    let defectsRaw = await loadDefeitos(true); // Carrega tudo

    console.log("========================================");
    console.log("🔍 [API DEBUG]");
    console.log(`📊 Total: ${defectsRaw.length}`);
    console.log(`⚠️ Ocorrências (Check Real): ${defectsRaw.filter(d => checkIsOcorrencia(d)).length}`);
    console.log("========================================");

    // --- SANITIZAÇÃO ---
    defectsRaw = defectsRaw.filter((row: any) => {
        const cat = norm(row.CATEGORIA || row.Categoria);
        const mod = row.MODELO || row.Modelo; 
        const isOcor = checkIsOcorrencia(row);

        // Se for ocorrência, passa sempre
        if (isOcor) return true;
        // Se for defeito, precisa de categoria/modelo
        if (!cat || !mod) return false;
        return true;
    });

    const applyFilters = (data: any[], isDefect: boolean, applyTime: boolean, isStrictDay: boolean = true, ignorePeriodDetails: boolean = false) => {
        return data.filter(row => {
            const r = row as any;
            const cat = norm(r.CATEGORIA || r.Categoria);
            const mod = norm(r.MODELO || r.Modelo);
            const rawTurno = r.TURNO || r.Turno || r.turno; 
            const turno = rawTurno ? normalizeTurno(rawTurno) : null;
            const resp = isDefect ? norm(r.RESPONSABILIDADE || r.Responsabilidade) : null;
            const dataRow = r.DATA || r.Data || r.data || r.date;
            const dataObj = parseDate(dataRow);
            const isOcor = isDefect && checkIsOcorrencia(r);

            if (filterCategoria) {
                if (cat) { if (!filterCategoria.includes(cat)) return false; } 
                else if (!isOcor) { return false; }
            }
            if (filterModelo) {
                if (mod) { if (!filterModelo.includes(mod)) return false; } 
                else if (!isOcor) { return false; }
            }
            if (filterTurno) {
                 if (!turno) return false; 
                 if (!filterTurno.includes(turno)) return false; 
            }
            if (isDefect && filterResponsabilidade && resp) {
                 // Agora que ocorrência tem nome de processo, ela passa aqui se o filtro for "AGRUPAMENTO DE PROCESSOS"
                 // Mas tudo bem, pois ela será segregada visualmente na tabela
                 if (!matchResponsabilidade(resp, filterResponsabilidade)) return false;
            }
            if (isStrictDay && filterDia && !ignorePeriodDetails) {
                const isoRow = extractDateIso(dataRow);
                if (isoRow !== filterDia) return false;
            }
            if (applyTime) {
                if (dataObj) {
                    const anoObj = dataObj.getFullYear();
                    const mesObj = dataObj.getMonth() + 1;
                    if (filterAno && anoObj !== filterAno) return false;
                    if (!ignorePeriodDetails) {
                        if (filterMes && mesObj !== filterMes && !filterSemana) return false;
                        if (filterSemana) {
                            const semObj = getWeekNumber(dataObj);
                            if (semObj !== filterSemana) return false;
                        }
                    }
                } else {
                    if (filterAno || filterMes || filterSemana) return false;
                }
            }
            return true;
        });
    };

    const productionCut = applyFilters(productionRaw, false, true, true, false);
    const defectsCut = applyFilters(defectsRaw, true, true, true, false); 
    
    const productionFull = applyFilters(productionRaw, false, true, false, true);
    const defectsFull = applyFilters(defectsRaw, true, true, false, true);

    // ✅ SEPARAÇÃO CRÍTICA (CORRIGIDO PARA USAR CÓDIGOS REAIS): 
    const defectsOnly = defectsCut.filter(d => !checkIsOcorrencia(d));
    const defectsFullOnly = defectsFull.filter(d => !checkIsOcorrencia(d));

    // MOTORES DE CÁLCULO
    const ppmResult = runPpmEngine(productionCut, defectsOnly);
    const { meta, byCategory, allRows } = ppmResult;
    const topCauses = calculateCausesRanking(productionCut, defectsOnly);
    
    // TABELA: Manda tudo
    const detailsRaw = calculateDetailsRanking(productionCut, defectsCut);

    // ✅ PÓS-PROCESSAMENTO DETALHES:
    const details = detailsRaw.map(turno => ({
        ...turno,
        groups: turno.groups.map(grp => ({
            ...grp,
            top3: grp.top3.map(row => ({
                ...row,
                isOcorrencia: checkIsOcorrencia({ 
                    "CÓDIGO DO FORNECEDOR": row.cod,
                    RESPONSABILIDADE: row.responsabilidade
                })
            }))
        }))
    }));

    const ppmMonthlyTrend = calculatePpmMonthlyTrend(productionFull, defectsFullOnly);
    const responsabilidadeMensal = calculateResponsabilidadeMensal(productionFull, defectsFullOnly);
    const categoriaMensal = calculateCategoriaMensal(productionFull, defectsFullOnly);
    const trendData = calculateTrendHierarchy(productionFull, defectsFullOnly);

    return NextResponse.json({
      meta: {
        totalProduction: meta.totalProduction,
        totalDefects: meta.totalDefects,
        ppmGeral: meta.ppmGeral,
        aiPrecision: meta.aiPrecision,
      },
      trendData, 
      topCauses,
      details, 
      ppmMonthlyTrend, 
      responsabilidadeMensal, 
      categoriaMensal,
      byCategory: Object.entries(byCategory).map(([categoria, v]) => ({
          categoria, produzido: v.production, defeitos: v.defects, ppm: v.ppm, aiPrecision: v.aiPrecision, status: v.status,
      })),
      byModel: allRows.map((r) => ({
        categoria: r.categoria, modelo: r.modelo, produzido: r.produzido, defeitos: r.defeitos, ppm: r.ppm, status: r.validationStatus,
      })),
    });

  } catch (err: any) {
    console.error("❌ Dashboard summary error:", err);
    return NextResponse.json({ error: "Erro ao gerar dashboard", details: err?.message }, { status: 500 });
  }
}