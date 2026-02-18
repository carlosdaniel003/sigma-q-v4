import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { ProductionInputRow } from "./ppmInputTypes";
import { NormalizedProduction } from "./ppmNormalizedTypes";

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
 * Garante que "C" vire "COMERCIAL", "2" vire "2º TURNO", etc.
 * Isso permite o match perfeito com o SQL de defeitos.
 */
function normalizeTurno(val: any): string {
  const s = String(val ?? "").trim().toUpperCase();
  if (!s || s === "UNDEFINED" || s === "NULL" || s === "") return "GERAL";

  if (s === "C" || s === "COM" || s.includes("COMERCIAL")) return "COMERCIAL";
  if (s === "1" || s === "1º" || s.includes("1 TURNO")) return "1º TURNO";
  if (s === "2" || s === "2º" || s.includes("2 TURNO")) return "2º TURNO";
  if (s === "3" || s === "3º" || s.includes("3 TURNO")) return "3º TURNO";

  return s;
}

// ✅ ATUALIZADO: Chave agora inclui TURNO padronizado
function buildGroupKey(row: ProductionInputRow): string {
  const categoria = norm(row.CATEGORIA);
  const modelo = norm(row.MODELO);
  
  // Usa a nova função de normalização para bater com o SQL
  const turno = normalizeTurno(row.TURNO); 
  
  if (!categoria || !modelo) return "";

  // 🕵️‍♂️ LOG DIAGNÓSTICO MANTIDO PARA VALIDAÇÃO
  if (modelo.includes("MICRO") || modelo.includes("MO-01")) {
    // eslint-disable-next-line no-console
  }
  
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
      if (parts[0].length === 4) {
          const [y, m, d] = parts.map(Number);
          date = new Date(y, m - 1, d);
      } else {
          const [d, m, y] = parts.map(Number);
          date = new Date(y, m - 1, d);
      }
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
   🔥 LOAD RAW — PRODUÇÃO
====================================================== */
export function loadProductionRaw(): ProductionInputRow[] {
  const filePath = path.join(
    process.cwd(),
    "public",
    "productions",
    "producao.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error("Arquivo producao.xlsx não encontrado");
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
  
  const validRows: ProductionInputRow[] = [];

  for (const r of rawRows) {
      const dataObj = parseExcelDate(r.DATA || r.Data || r.Date);
      
      if (!dataObj || dataObj.getFullYear() !== 2026) {
          continue; 
      }

      const rawQtd = r.QTY_GERAL ?? r.Qty_Geral ?? r.QUANTIDADE ?? r.Quantidade ?? r.PRODUZIDO ?? r.Produzido ?? 0;
      // Pegamos o turno bruto aqui para o buildGroupKey normalizar
      const rawTurno = r.TURNO ?? r.Turno ?? "GERAL";

      validRows.push({
          DATA: dataObj,
          MODELO: norm(r.MODELO || r.Modelo),
          CATEGORIA: norm(r.CATEGORIA || r.Categoria),
          TURNO: String(rawTurno).trim(), 
          QTY_GERAL: Number(rawQtd)
      });
  }

  // eslint-disable-next-line no-console
  console.log(`🧹 [LoadProduction] Filtrado para 2026: ${validRows.length} registros.`);

  return validRows;
}

/* ======================================================
   NORMALIZA PRODUÇÃO
====================================================== */
export function normalizeProductionForPpm(
  rows: ProductionInputRow[]
): NormalizedProduction[] {
  const map = new Map<string, NormalizedProduction>();

  for (const r of rows) {
    const produzido = Number(r.QTY_GERAL) || 0;
    if (produzido <= 0) continue;

    const groupKey = buildGroupKey(r);
    if (!groupKey) continue;

    const dataProducao = r.DATA instanceof Date ? r.DATA : parseExcelDate(r.DATA);

    if (!map.has(groupKey)) {
      map.set(groupKey, {
        groupKey,
        categoria: norm(r.CATEGORIA),
        modelo: norm(r.MODELO),
        turno: normalizeTurno(r.TURNO),
        produzido: 0,
        datasProducao: [],
      });
    }

    const item = map.get(groupKey)!;
    item.produzido += produzido;

    if (dataProducao) {
      item.datasProducao!.push(dataProducao);
    }
  }

  return Array.from(map.values());
}