/* ======================================================
   PPM — Tipos Normalizados
====================================================== */

export interface NormalizedProduction {
  groupKey: string;
  categoria: string;
  modelo: string;
  turno?: string; // ✅ ADICIONADO: Essencial para separar produção por turno
  produzido: number;
  datasProducao?: Date[];
}

export interface NormalizedDefect {
  groupKey: string;
  defeitos: number;
  datasDefeito?: Date[];
  naoMostrarIndice?: boolean;
  tipoRegistro?: "OCORRENCIA" | "NORMAL";
}