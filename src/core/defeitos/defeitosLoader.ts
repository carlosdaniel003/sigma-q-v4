import { enrichDefeito, EnrichmentOptions } from "./defeitosEnrichment";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";
import { loadDefeitos } from "../data/loadDefeitos";

export async function loadDefeitosFonte(
  fonte: string,
  opts: EnrichmentOptions,
  catalogo?: { codigos: any[]; falhas: any[]; responsabilidades: any[] }
) {
  // 1. Só processamos "produto" (SQL). O resto é ignorado.
  if (fonte.toLowerCase() !== "produto") return [];

  const raw = await loadDefeitos();
  const enriched: any[] = [];
  const cat = catalogo ?? (await loadCatalogo());

  // Log para acompanhar no terminal
  console.log(`  ⚡ Processando ${raw.length} registros do SQL...`);

  for (let r of raw) {
    const e = await enrichDefeito(r, opts, cat);
    enriched.push(e);
  }

  return enriched;
}

export async function loadDefeitosAll(opts: EnrichmentOptions) {
  const cat = await loadCatalogo();

  // Chamamos apenas o SQL. Ignoramos AF, LCM e PTH.
  const prod = await loadDefeitosFonte("produto", opts, cat);

  return {
    // Mantemos as chaves para não quebrar outros arquivos, mas todas vazias exceto produto
    af: [],
    lcm: [],
    produto: prod,
    pth: [],
    todas: prod // Aqui estão todos os seus dados de 2026
  };
}