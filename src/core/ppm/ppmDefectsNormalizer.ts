import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { DefectInputRow } from "./ppmInputTypes";
import { NormalizedDefect } from "./ppmNormalizedTypes";

/* ======================================================
   Utils
====================================================== */
function norm(value: any): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * ✅ PADRONIZAÇÃO UNIFICADA DE TURNO
 * Sincronizado com o ProductionNormalizer para garantir que as chaves batam.
 */
function normalizeTurno(val: any): string {
    const s = String(val ?? "").trim().toUpperCase();
    if (!s || s === "UNDEFINED" || s === "NULL" || s === "") return "GERAL";
    
    // Mapeamentos para padronizar com a Produção (Ex: converter "2" ou "2 TURNO" para "2º TURNO")
    if (s === "C" || s === "COM" || s.startsWith("COM") || s.includes("COMERCIAL")) return "COMERCIAL";
    if (s === "1" || s === "1º" || s.startsWith("1") || s.includes("1 TURNO")) return "1º TURNO";
    if (s === "2" || s === "2º" || s.startsWith("2") || s.includes("2 TURNO")) return "2º TURNO";
    if (s === "3" || s === "3º" || s.startsWith("3") || s.includes("3 TURNO")) return "3º TURNO";
    
    return s;
}

// ✅ BUILD KEY COM LOG DIAGNÓSTICO
function buildGroupKey(row: DefectInputRow): string {
  const categoria = norm(row.CATEGORIA);
  const modelo = norm(row.MODELO);
  
  // Lê o turno da linha bruta e aplica a normalização unificada
  const rawTurno = (row as any).TURNO || (row as any).Turno || (row as any).turno;
  const turno = normalizeTurno(rawTurno);

  // 🕵️‍♂️ LOG DIAGNÓSTICO MANTIDO PARA VALIDAR O MATCH
  if (modelo.includes("MICRO") || modelo.includes("MO-01")) {
      // eslint-disable-next-line no-console
  }

  if (!categoria || !modelo) return "";
  
  return `${categoria}::${modelo}::${turno}`;
}

/* ======================================================
   🔥 PARSER ROBUSTO DE DATA
====================================================== */
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  let date: Date | null = null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    date = new Date(value.getTime());
  }
  else if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    date = new Date(excelEpoch.getTime() + value * 86400000);
  }
  else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/[\/\-]/);
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      date = new Date(y, m - 1, d);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  }

  if (!date || isNaN(date.getTime())) return null;
  date.setHours(12, 0, 0, 0);
  return date;
}

/* ======================================================
   CATÁLOGO
====================================================== */
let catalogoSet = new Set<string>();

try {
  const catalogoPath = path.join(
    process.cwd(),
    "app",
    "development",
    "catalogo",
    "data",
    "catalogo_nao_mostrar_indice.xlsx"
  );

  if (fs.existsSync(catalogoPath)) {
    const buffer = fs.readFileSync(catalogoPath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    catalogoSet = new Set(
      rows
        .map((r) => norm(r["CÓDIGO"] || r["CODIGO"]))
        .filter(Boolean)
    );
  }
} catch (err) {
  console.warn("⚠️ [PPM] Erro ao carregar catálogo 'não mostrar índice'.", err);
}

/* ======================================================
   LOAD RAW
====================================================== */
export function loadDefectsRaw(): DefectInputRow[] {
  const filePath = path.join(
    process.cwd(),
    "public",
    "defeitos",
    "defeitos_produto_acabado.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error("Arquivo defeitos não encontrado");
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json<DefectInputRow>(sheet);
}

/* ======================================================
   NORMALIZA
====================================================== */
export function normalizeDefectsForPpm(
  rows: DefectInputRow[]
): {
  normalized: NormalizedDefect[];
  totalOccurrences: number;
  occurrencesByCode: Record<string, number>;
  occurrencesByCategory: Record<string, number>;
} {
  const map = new Map<string, { defeitos: number; datasDefeito: Date[] }>();
  let totalOccurrences = 0;
  const occurrencesByCode: Record<string, number> = {};
  const occurrencesByCategory: Record<string, number> = {};

  rows.forEach((r) => {
    const qtd = Number(r.QUANTIDADE) || 0;
    if (qtd <= 0) return;

    const categoria = norm(r.CATEGORIA);
    const codigoFornecedor = norm((r as any)["CÓDIGO DO FORNECEDOR"]);
    const dataDefeito = parseExcelDate((r as any).DATA ?? (r as any).DATA_DEFEITO);

    if (catalogoSet.has(codigoFornecedor)) {
      totalOccurrences += 1;
      occurrencesByCode[codigoFornecedor] = (occurrencesByCode[codigoFornecedor] || 0) + 1;
      occurrencesByCategory[categoria] = (occurrencesByCategory[categoria] || 0) + 1;
      return;
    }

    const groupKey = buildGroupKey(r);
    if (!groupKey) return;

    if (!map.has(groupKey)) {
      map.set(groupKey, { defeitos: 0, datasDefeito: [] });
    }

    const item = map.get(groupKey)!;
    item.defeitos += qtd;
    if (dataDefeito) item.datasDefeito.push(dataDefeito);
  });

  const normalized: NormalizedDefect[] = Array.from(map.entries()).map(([groupKey, info]) => ({
    groupKey,
    defeitos: info.defeitos,
    datasDefeito: info.datasDefeito,
    naoMostrarIndice: false,
    tipoRegistro: "NORMAL",
  }));

  return {
    normalized,
    totalOccurrences,
    occurrencesByCode,
    occurrencesByCategory,
  };
}