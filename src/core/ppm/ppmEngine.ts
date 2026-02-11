import {
  ProductionInputRow,
  DefectInputRow,
} from "./ppmInputTypes";

import { normalizeProductionForPpm } from "./ppmProductionNormalizer";
import { normalizeDefectsForPpm } from "./ppmDefectsNormalizer";
import { mergeProductionAndDefects } from "./ppmMerger";
import { calculatePpm } from "./ppmCalculator";
import { validatePpm } from "./ppmValidator";
import { PpmEngineResult } from "./ppmEngineResultTypes";

/* ======================================================
   MOTOR PPM — FONTE ÚNICA DE VERDADE
====================================================== */
export function runPpmEngine(
  productionRaw: ProductionInputRow[],
  defectsRaw: DefectInputRow[]
): PpmEngineResult {

  /* ======================================================
      0️⃣ PRÉ-PROCESSAMENTO: DATA DE CORTE (Cut-off)
  ====================================================== */
  let maxProductionTimestamp = 0;

  for (const row of productionRaw) {
      if (row.DATA instanceof Date) {
          const ts = row.DATA.getTime();
          if (ts > maxProductionTimestamp) {
              maxProductionTimestamp = ts;
          }
      }
  }

  let defectsToProcess = defectsRaw;
  
  if (maxProductionTimestamp > 0) {
      defectsToProcess = defectsRaw.filter((d) => {
          if (!d.DATA) return false;
          const defDate = d.DATA instanceof Date ? d.DATA : new Date(d.DATA);
          const defTs = defDate.getTime();
          return defTs <= maxProductionTimestamp;
      });

      const descartadosPorData = defectsRaw.length - defectsToProcess.length;
      if (descartadosPorData > 0) {
          console.log(
              `🗓️ [PPM Engine] Cut-off Temporal aplicado: ${descartadosPorData} defeitos ignorados.`
          );
      }
  }

  /* ======================================================
      1️⃣ NORMALIZAÇÃO (AGORA COM TURNO)
      ⚠️ Atenção: normalizeProductionForPpm agora gera chaves 
      com Turno (ex: TV::MOD::1). O normalizeDefectsForPpm 
      TAMBÉM precisa gerar chaves com Turno para o Merge funcionar.
  ====================================================== */
  const prod = normalizeProductionForPpm(productionRaw);

  const {
    normalized: def,
    totalOccurrences,
    occurrencesByCode,
    occurrencesByCategory,
  } = normalizeDefectsForPpm(defectsToProcess); 

  /* ======================================================
      2️⃣ MERGE + CÁLCULO
  ====================================================== */
  const merged = mergeProductionAndDefects(prod, def);
  const calculationResult = calculatePpm(merged);
  const validated = validatePpm(calculationResult.results);

  /* ======================================================
      3️⃣ SEPARAÇÃO CLARA
  ====================================================== */
  const naoMostrarIndice = validated.filter(
    (r) => r.naoMostrarIndice === true
  );

  const considerados = validated.filter(
    (r) => r.naoMostrarIndice !== true
  );

  /* ======================================================
      4️⃣ KPIs GLOBAIS
  ====================================================== */
  const totalProduction = prod.reduce(
    (s, p) => s + (p.produzido || 0),
    0
  );

  const totalDefects = considerados.reduce(
    (s, r) => s + (r.defeitos || 0),
    0
  );

  const ppmGeral =
  totalProduction > 0
    ? Number(
        ((totalDefects / totalProduction) * 1_000_000).toFixed(2)
      )
    : null;

  const validCount = considerados.filter(
    (r) => r.validationStatus === "VALID"
  ).length;

  const aiPrecision =
    considerados.length > 0
      ? Math.round((validCount / considerados.length) * 100)
      : 0;

  /* ======================================================
      5️⃣ PRODUÇÃO REAL POR CATEGORIA
  ====================================================== */
  const productionByCategory: Record<string, number> = {};

  for (const p of prod) {
    productionByCategory[p.categoria] =
      (productionByCategory[p.categoria] || 0) + p.produzido;
  }

  /* ======================================================
      6️⃣ AGRUPAMENTO POR CATEGORIA
  ====================================================== */
  const byCategory: PpmEngineResult["byCategory"] = {};

  for (const row of validated) {
    const categoria = row.categoria || "SEM_CATEGORIA";

    if (!byCategory[categoria]) {
      byCategory[categoria] = {
        production: productionByCategory[categoria] ?? 0,
        defects: 0,
        ppm: null,
        aiPrecision: 0,
        status: "CRITICO",
        models: [],
      };
    }

    if (!row.naoMostrarIndice) {
      byCategory[categoria].defects += row.defeitos;
    }

    byCategory[categoria].models.push(row);
  }

  /* ======================================================
      7️⃣ KPIs POR CATEGORIA
  ====================================================== */
  for (const categoria of Object.keys(byCategory)) {
    const c = byCategory[categoria];

    if (c.production > 0) {
      c.ppm = Number(
        ((c.defects / c.production) * 1_000_000).toFixed(2)
      );
    }

    const validos = c.models.filter(
      (m) => m.validationStatus === "VALID"
    ).length;

    c.aiPrecision =
      c.models.length > 0
        ? Math.round((validos / c.models.length) * 100)
        : 0;

    c.status = c.aiPrecision >= 90 ? "SAUDAVEL" : "CRITICO";
  }

  /* ======================================================
      8️⃣ RETORNO FINAL
  ====================================================== */
  return {
    meta: {
      totalGroups: considerados.length,
      totalProduction,
      totalDefects,
      ppmGeral,
      aiPrecision,
      naoMostrarIndiceCount: naoMostrarIndice.length,

      totalOccurrences,
      occurrencesByCode,
      occurrencesByCategory,
    },

    globalDiagnostics: {
      defectsWithoutProduction: considerados.filter(
        (r) => r.produzido === 0 && r.defeitos > 0
      ).length,
      productionWithoutDefect: considerados.filter(
        (r) => r.produzido > 0 && r.defeitos === 0
      ).length,
      zeroPpmItems: considerados.filter(
        (r) => r.ppm === 0
      ).length,
      naoMostrarIndice,
    },

    byCategory,
    allRows: validated,
  };
}