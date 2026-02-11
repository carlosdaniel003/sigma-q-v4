import { NormalizedProduction, NormalizedDefect } from "./ppmNormalizedTypes";
import { MergedPpmRow } from "./ppmMergedTypes";

export function mergeProductionAndDefects(
  production: NormalizedProduction[],
  defects: NormalizedDefect[]
): MergedPpmRow[] {
  const map = new Map<string, MergedPpmRow>();

  // 1️⃣ MAPEIA PRODUÇÃO
  for (const p of production) {
    map.set(p.groupKey, {
      groupKey: p.groupKey,
      categoria: p.categoria,
      modelo: p.modelo,
      produzido: p.produzido,
      defeitos: 0,
      datasProducao: p.datasProducao ?? [],
      datasDefeito: [],
      flags: {
        hasProduction: true,
        hasDefect: false,
        fixedBySemiFinished: false,
      },
      naoMostrarIndice: false,
      tipoRegistro: "NORMAL",
    });
  }

  // 2️⃣ MAPEIA DEFEITOS (COM RASTREADOR DE INCONSISTÊNCIA)
  for (const d of defects) {
    if (!map.has(d.groupKey)) {
      
      // 🕵️‍♂️ RASTREADOR: Se o modelo for o Micro-ondas ou a lista de erros estiver alta
      if (d.groupKey.includes("MICROONDAS") || d.groupKey.includes("MO01")) {
         console.log("🚨 [DEBUG PPM] Defeito órfão detectado!");
         console.log(`   - Chave do Defeito (SQL): "${d.groupKey}"`);
         
         // Vamos listar chaves similares na produção para comparar
         const similarKeys = Array.from(map.keys()).filter(k => k.includes("MO01")).slice(0, 3);
         console.log(`   - Chaves similares na Produção (Excel):`, similarKeys);
      }

      map.set(d.groupKey, {
        groupKey: d.groupKey,
        categoria: d.groupKey.split("::")[0],
        modelo: d.groupKey.split("::")[1],
        produzido: 0,
        defeitos: d.defeitos,
        datasProducao: [],
        datasDefeito: d.datasDefeito ?? [],
        naoMostrarIndice: d.naoMostrarIndice === true,
        tipoRegistro: d.tipoRegistro,
        flags: {
          hasProduction: false,
          hasDefect: true,
          fixedBySemiFinished: false,
        },
      });
    } else {
      const item = map.get(d.groupKey)!;
      item.defeitos += d.defeitos;
      item.flags.hasDefect = true;

      if (d.datasDefeito?.length) {
        item.datasDefeito.push(...d.datasDefeito);
      }

      if (d.naoMostrarIndice === true) {
        item.naoMostrarIndice = true;
        item.tipoRegistro = "OCORRENCIA";
      }
    }
  }

  return Array.from(map.values());
}