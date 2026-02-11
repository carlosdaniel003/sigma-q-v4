import { NextRequest, NextResponse } from "next/server";

// Loader de Produção (Garante que vem do normalizer que le o Excel 2026)
import { loadProductionRaw } from "@/core/ppm/ppmProductionNormalizer";
// Loader de Defeitos (Vem do SQL)
import { loadDefeitos } from "@/core/data/loadDefeitos";

import { runPpmEngine } from "@/core/ppm/ppmEngine";
import { calculatePpmMonthlyTrend } from "@/core/ppm/ppmMonthlyTrend";
import { calculateResponsabilidadeMensal } from "@/core/ppm/ppmResponsabilidadeMensal";
import { calculateCategoriaMensal } from "@/core/ppm/ppmCategoriaMensal";
import { calculateTrendHierarchy } from "@/core/dashboard/dashboardTrendEngine";
import { calculateCausesRanking } from "@/core/dashboard/dashboardCausesEngine";
import { calculateDetailsRanking } from "@/core/dashboard/dashboardDetailsEngine";

/* ======================================================
   UTILS
====================================================== */
function norm(val: any) {
  return String(val ?? "").trim().toUpperCase();
}

// 🔄 NORMALIZADOR DE TURNO ROBUSTO
// Garante que "Comercial", "C", "comercial" virem todos "COMERCIAL"
function normalizeTurno(val: any): string {
    if (!val) return "";
    const v = norm(val);
    
    // Mapeamentos comuns
    if (v === "C" || v === "COMERCIAL" || v === "ADM") return "COMERCIAL";
    if (v === "BC" || v === "2" || v === "2º" || v.includes("2º TURNO") || v.includes("2 TURNO")) return "2º TURNO";
    if (v === "A" || v === "1" || v === "1º" || v.includes("1º TURNO") || v.includes("1 TURNO")) return "1º TURNO";
    if (v === "3" || v === "3º" || v.includes("3º TURNO")) return "3º TURNO";
    
    return v; // Retorna o valor original normalizado se não cair nos casos acima
}

function parseDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
        return new Date(Math.round((val - 25569) * 86400 * 1000) + (12 * 3600 * 1000));
    }
    if (typeof val === 'string') {
        // Tenta DD/MM/YYYY
        const matchBr = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (matchBr) {
             return new Date(parseInt(matchBr[3]), parseInt(matchBr[2])-1, parseInt(matchBr[1]), 12, 0, 0);
        }
        // Tenta ISO
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

const VALID_CAT = new Set(["BBS", "CM", "TV", "MWO", "TW", "TM", "ARCON", "NBX"]);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // --- HELPER PARA PEGAR ARRAY DE FILTROS ---
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
    
    // ✅ 1. PEGA E NORMALIZA O FILTRO DE TURNO DA URL
    let filterTurnoRaw = getMultiFilter("turno");
    let filterTurno: string[] | null = null;
    if (filterTurnoRaw) {
        filterTurno = filterTurnoRaw.map(t => normalizeTurno(t));
    }

    const filterDia = searchParams.get("dia");
    const filterMes = searchParams.get("mes") ? parseInt(searchParams.get("mes")!) : null;
    const filterAno = searchParams.get("ano") ? parseInt(searchParams.get("ano")!) : null;
    const filterSemana = searchParams.get("semana") ? parseInt(searchParams.get("semana")!) : null;

    // --- CARREGAMENTO DE DADOS ---
    // ProductionInputRow[] já vem com { DATA, MODELO, CATEGORIA, TURNO, QTY_GERAL }
    let productionRaw = loadProductionRaw(); 
    
    // DefectInputRow[]
    let defectsRaw = await loadDefeitos(); 

    // --- SANITIZAÇÃO DE DEFEITOS ---
    defectsRaw = defectsRaw.filter((row: any) => {
        const cat = norm(row.CATEGORIA || row.Categoria);
        const mod = row.MODELO || row.Modelo; 
        if (!cat || !mod) return false;
        // Permite flexibilidade mas foca nas categorias principais
        // if (!VALID_CAT.has(cat)) return false; 
        return true;
    });

    // ✅ --- FUNÇÃO DE FILTRO CENTRALIZADA E CORRIGIDA ---
    const applyFilters = (data: any[], isDefect: boolean, applyTime: boolean, isStrictDay: boolean = true) => {
        return data.filter(row => {
            const r = row as any;
            
            // Extração de Dados
            const cat = norm(r.CATEGORIA || r.Categoria);
            const mod = norm(r.MODELO || r.Modelo);
            
            // Tratamento de Turno na Linha (Row)
            const rawTurno = r.TURNO || r.Turno || r.turno; 
            // Se for defeito, às vezes o turno vem null, podemos assumir algo ou deixar null
            const turno = rawTurno ? normalizeTurno(rawTurno) : null;

            const resp = isDefect ? norm(r.RESPONSABILIDADE || r.Responsabilidade) : null;
            
            const dataRow = r.DATA || r.Data || r.data || r.date;
            const dataObj = parseDate(dataRow);

            // --- APLICAÇÃO DOS FILTROS ---

            // 1. Categoria
            if (filterCategoria && !filterCategoria.includes(cat)) return false;
            
            // 2. Modelo
            if (filterModelo && !filterModelo.includes(mod)) return false;
            
            // ✅ 3. TURNO (CORREÇÃO CRÍTICA)
            if (filterTurno) {
                 // Se o usuário selecionou um turno, a linha PRECISA ter turno e bater com o filtro
                 if (!turno) return false; // Descarta linhas sem turno definido (Geral)
                 if (!filterTurno.includes(turno)) return false; // Descarta turno errado
            }
            
            // 4. Responsabilidade (Só para defeitos)
            if (isDefect && filterResponsabilidade && resp) {
                 if (!filterResponsabilidade.includes(resp)) return false;
            }

            // --- FILTROS DE TEMPO ---
            
            // 5. Dia Exato (Prioridade Máxima para KPIs)
            if (isStrictDay && filterDia) {
                const isoRow = extractDateIso(dataRow);
                if (isoRow !== filterDia) return false;
            }

            // 6. Período (Mês/Semana/Ano)
            if (applyTime) {
                if (dataObj) {
                    const anoObj = dataObj.getFullYear();
                    const mesObj = dataObj.getMonth() + 1;
                    
                    if (filterAno && anoObj !== filterAno) return false;
                    if (filterMes && mesObj !== filterMes && !filterSemana) return false;
                    
                    if (filterSemana) {
                        const semObj = getWeekNumber(dataObj);
                        if (semObj !== filterSemana) return false;
                    }
                } else {
                    // Se tem filtro de tempo mas o dado não tem data, descarta
                    if (filterAno || filterMes || filterSemana) return false;
                }
            }

            return true;
        });
    };

    // --- APLICAÇÃO ---

    // 1. Dados Recortados (KPIs, Ranking e Detalhes) 
    // isStrictDay = true (filtra dia se selecionado)
    const productionCut = applyFilters(productionRaw, false, true, true);
    const defectsCut = applyFilters(defectsRaw, true, true, true);

    // 2. Dados Históricos (Gráficos e Tendência) 
    // isStrictDay = false (pega o mês todo mesmo se dia selecionado, para mostrar linha do tempo)
    const productionFull = applyFilters(productionRaw, false, true, false);
    const defectsFull = applyFilters(defectsRaw, true, true, false);

    /* ======================================================
        MOTORES DE CÁLCULO
    ====================================================== */
    
    // KPIs principais
    const ppmResult = runPpmEngine(productionCut, defectsCut);
    const { meta, byCategory, allRows } = ppmResult;
    
    const topCauses = calculateCausesRanking(productionCut, defectsCut);
    const details = calculateDetailsRanking(productionCut, defectsCut);

    // Tendências
    const ppmMonthlyTrend = calculatePpmMonthlyTrend(productionFull, defectsFull);
    const responsabilidadeMensal = calculateResponsabilidadeMensal(productionFull, defectsFull);
    const categoriaMensal = calculateCategoriaMensal(productionFull, defectsFull);
    const trendData = calculateTrendHierarchy(productionFull, defectsFull);

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