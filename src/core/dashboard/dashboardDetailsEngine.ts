import { ProductionInputRow, DefectInputRow } from "@/core/ppm/ppmInputTypes";

export interface DetailRow {
  rank: number;
  cod: string;
  falha: string;
  peca: string;
  ref: string;
  analise: string;
  responsabilidade: string;
  modelo: string;
  qtd: number;
  ppm: number;
  categoria?: string;
  isOcorrencia?: boolean;
  originalRows?: DefectInputRow[]; // ✅ NOVO: Guarda os dados brutos para o Drill-down
}

export interface ResponsibilityGroup {
  responsibility: string;
  top3: DetailRow[];
}

export interface TurnoStats {
  turno: string;
  producao: number;
  totalDefeitos: number;
  groups: ResponsibilityGroup[]; 
}

// ✅ LISTA REAL DE CÓDIGOS (Sincronizada com Route e Translations)
const CODIGOS_OCORRENCIA_CHECK = [
  "A", "RC", "AF RET", "FF", "VER", "INT MOD", 
  "RT", "OC", "AN", "AC", "RV"
];

function norm(val: any) {
  return String(val ?? "").trim().toUpperCase();
}

function normalizeTurno(val: any) {
    const s = String(val ?? "").trim().toUpperCase();
    if (!s || s === "UNDEFINED" || s === "NULL" || s === "") return "GERAL";
    if (s === "C" || s.startsWith("COM") || s.includes("COMERCIAL")) return "COMERCIAL";
    if (s.startsWith("1") || s === "PRIMEIRO") return "1º TURNO";
    if (s.startsWith("2") || s === "SEGUNDO") return "2º TURNO";
    if (s.startsWith("3") || s === "TERCEIRO") return "3º TURNO";
    if (s.includes("ADM")) return "ADM";
    return s;
}

// ✅ HELPER: Identifica se é Ocorrência (Por código REAL)
function checkIsOcorrencia(row: any): boolean {
    const resp = norm(row.RESPONSABILIDADE || row.Responsabilidade || "");
    const cod = norm(row["CÓDIGO DO FORNECEDOR"] || row.CODIGO || "");
    
    // 1. Pelo Código (Prioridade com lista real)
    if (CODIGOS_OCORRENCIA_CHECK.some(c => c === cod)) return true;

    // 2. Pelo Nome (Fallback)
    if (resp.includes("OCORRENCIA") || resp.includes("OCORRÊNCIA")) return true;

    return false;
}

export function calculateDetailsRanking(
  production: ProductionInputRow[],
  defects: DefectInputRow[]
): TurnoStats[] {
  
  // 1. Mapa de Produção por Turno
  const productionByTurno = new Map<string, number>();
  // ✅ Mapa de Produção por Modelo/Turno para cálculo preciso do PPM Individual
  const productionByModelTurno = new Map<string, number>();
  
  production.forEach(p => {
    const rawTurno = (p as any).TURNO || (p as any).Turno || "GERAL";
    const turno = normalizeTurno(rawTurno);
    const qtd = Number(p.QTY_GERAL ?? (p as any).produzido ?? 0);
    const modelo = norm(p.MODELO || (p as any).Modelo || "GERAL");

    if (!isNaN(qtd)) {
        // Soma total do turno
        productionByTurno.set(turno, (productionByTurno.get(turno) || 0) + qtd);
        
        // Soma específica do modelo no turno
        const key = `${turno}|${modelo}`;
        productionByModelTurno.set(key, (productionByModelTurno.get(key) || 0) + qtd);
    }
  });

  // 2. Agrupar Defeitos por Turno
  const turnoDefectMap = new Map<string, Map<string, any>>();
  const turnoTotalDefects = new Map<string, number>();

  defects.forEach(d => {
    const row = d as any;
    const turno = normalizeTurno(row.TURNO || row.Turno);
    if (turno === "GERAL") return;

    const qtd = Number(row.QUANTIDADE ?? 0);
    if (isNaN(qtd) || qtd <= 0) return;

    // ✅ DETECTA OCORRÊNCIA
    const isOcorrencia = row.isOcorrencia || checkIsOcorrencia(row);

    // Se for Ocorrência, NÃO SOMA no total de defeitos do cabeçalho
    if (!isOcorrencia) {
        turnoTotalDefects.set(turno, (turnoTotalDefects.get(turno) || 0) + qtd);
    }

    const cod = norm(row["CÓDIGO DO FORNECEDOR"] || row.CODIGO || "");
    const falha = norm(row["DESCRIÇÃO DA FALHA"] || row.DESCRICAO_DA_FALHA || "");
    const peca = norm(row["PEÇA/PLACA"] || row.PECA_PLACA || "");
    const ref = norm(row["REFERÊNCIA/POSIÇÃO MECÂNICA"] || row.REFERENCIA || "");
    const analise = norm(row.ANALISE || row["ANÁLISE"] || "");
    const resp = norm(row.RESPONSABILIDADE || "OUTROS");
    const modelo = norm(row.MODELO || ""); 
    const categoria = norm(row.CATEGORIA || row.Categoria || "GERAL");

    const signature = `${cod}|${falha}|${peca}|${ref}|${analise}|${resp}|${modelo}|${categoria}`;

    if (!turnoDefectMap.has(turno)) {
      turnoDefectMap.set(turno, new Map());
    }

    const groups = turnoDefectMap.get(turno)!;
    if (!groups.has(signature)) {
      groups.set(signature, {
        cod, falha, peca, ref, analise, 
        responsabilidade: resp, 
        modelo, 
        categoria,      
        isOcorrencia,   
        qtd: 0,
        originalRows: [] // ✅ Inicializa o array de drill-down
      });
    }
    
    // ✅ Acumula os dados
    const groupItem = groups.get(signature)!;
    groupItem.qtd += qtd;
    groupItem.originalRows.push(row); // ✅ Guarda o registro original
  });

  // 3. Montar Resultado Final
  const result: TurnoStats[] = [];
  const turnosSorted = Array.from(turnoDefectMap.keys()).sort();

  turnosSorted.forEach(turno => {
    const prodTurnoTotal = productionByTurno.get(turno) || 0;
    const totalDef = turnoTotalDefects.get(turno) || 0;
    
    const byResp = new Map<string, any[]>();
    const items = Array.from(turnoDefectMap.get(turno)!.values());

    items.forEach(item => {
        if (!byResp.has(item.responsabilidade)) {
            byResp.set(item.responsabilidade, []);
        }
        byResp.get(item.responsabilidade)!.push(item);
    });

    const groups: ResponsibilityGroup[] = [];
    const respSorted = Array.from(byResp.keys()).sort();

    respSorted.forEach(respName => {
        const rows = byResp.get(respName)!;
        
        // Separa Defeitos e Ocorrências
        const defectRows = rows.filter(r => !r.isOcorrencia).sort((a, b) => b.qtd - a.qtd);
        const occurrenceRows = rows.filter(r => r.isOcorrencia).sort((a, b) => b.qtd - a.qtd);

        const topDefects = defectRows.slice(0, 3);
        const topOccurrences = occurrenceRows.slice(0, 3);

        const combinedRows = [...topDefects, ...topOccurrences];

        const top3: DetailRow[] = combinedRows.map((item, index) => {
            // Tenta calcular o PPM baseado na produção DO MODELO ESPECÍFICO
            const modelKey = `${turno}|${item.modelo}`;
            const prodModel = productionByModelTurno.get(modelKey) || 0;
            
            // Se não tiver produção específica, usa a do turno (fallback), mas o ideal é o modelo.
            // Para PPM de item individual, usamos (qtd / produção do modelo) * 1M
            // Se prodModel for 0, o PPM será 0 (evita divisão por zero)
            const baseProd = prodModel > 0 ? prodModel : prodTurnoTotal;
            
            let ppmValue = 0;
            if (baseProd > 0) {
                ppmValue = (item.qtd / baseProd) * 1_000_000;
            }

            return {
                rank: index + 1,
                cod: item.cod,
                falha: item.falha,
                peca: item.peca,
                ref: item.ref,
                analise: item.analise,
                responsabilidade: item.responsabilidade,
                modelo: item.modelo,
                qtd: item.qtd,
                // ✅ PPM calculado para TODOS (inclusive ocorrências), meramente informativo
                ppm: ppmValue,
                categoria: item.categoria,
                isOcorrencia: item.isOcorrencia,
                originalRows: item.originalRows // ✅ Passa os dados brutos para o Frontend
            };
        });

        groups.push({
            responsibility: respName,
            top3 
        });
    });

    result.push({
        turno,
        producao: prodTurnoTotal, 
        totalDefeitos: totalDef,
        groups
    });
  });

  return result;
}