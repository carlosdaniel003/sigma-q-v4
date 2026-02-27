import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";
// 👇 IMPORTANTE: Loader para acessar os arquivos brutos dos catálogos
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";
// ✅ IMPORTAÇÃO DO CARREGADOR DE PRODUÇÃO UNIFICADO (SQL)
import { loadProducao } from "@/core/data/loadProducao";

/** normalize */
function norm(v: any) {
  return String(v ?? "")
    .normalize?.("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/** Levenshtein similarity (0..1) */
function levenshteinSimilarity(a: string, b: string) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return 0;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}

// GRUPO A: Erro Proposital (TV-xxx) - IMPACTA KPI
function isErroProposital(modelName: string): boolean {
  return modelName.startsWith("TV-");
}

// GRUPO B1: INCONSISTÊNCIA NA PRODUÇÃO / Engenharia - NÃO IMPACTA KPI
function isPreProducao(modelName: string): boolean {
  const m = modelName.toUpperCase();
  return ["EVAPORADOR", "CONDENSADOR", "AWS-"].some(k => m.includes(k));
}

// GRUPO B2: Produção Parcial - NÃO IMPACTA KPI
function isProducaoParcial(modelName: string): boolean {
  const m = modelName.toUpperCase();
  return ["BX-", "DAIKIN", "PLACA"].some(k => m.includes(k));
}

/**
 * 🕵️‍♂️ EXPLICADOR INTELIGENTE (COM RASTREAMENTO)
 * Agora ele vasculha os catálogos e diz exatamente o que encontrou.
 */
function explainMismatch(prod: any, defeitosLista: any[], catalogs: any) {
  const modelo = prod.MODELO;
  const trace: string[] = []; // Log de investigação

  // 1. Busca no Catálogo Oficial (catalogo_codigos.xlsx)
  // O loader retorna { codigos: [], ... }
  const officialList = catalogs?.codigos || [];
  let foundInCatalog = false;
  let bestCatalogMatch = { score: 0, name: "" };

  for (const item of officialList) {
    // Normaliza campos do catálogo (pode variar o nome da coluna)
    const catModel = norm(item.MODELO ?? item.DESCRIÇÃO ?? item.PRODUTO ?? "");
    
    if (catModel === modelo) {
      foundInCatalog = true;
      break;
    }
    
    // Verifica similaridade para dar dica
    const sim = levenshteinSimilarity(modelo, catModel);
    if (sim > bestCatalogMatch.score) {
      bestCatalogMatch = { score: sim, name: catModel };
    }
    
    // Verifica "Contains" (ex: ALTO FALANTE CM-500 contém CM-500)
    if (catModel.includes(modelo) && modelo.length > 4) {
       if (0.8 > bestCatalogMatch.score) {
          bestCatalogMatch = { score: 0.85, name: catModel }; // Bonus por conter
       }
    }
  }

  if (foundInCatalog) {
    trace.push(`✅ Encontrado em catalogo_codigos.xlsx (Mas talvez a grafia varie).`);
  } else {
    trace.push(`❌ catalogo_codigos.xlsx: Não encontrado.`);
    if (bestCatalogMatch.score > 0.4) {
      trace.push(`   ↳ Mais parecido: "${bestCatalogMatch.name}" (${(bestCatalogMatch.score*100).toFixed(0)}% match).`);
    }
  }

  // 2. Busca na Base de Defeitos (Histórico)
  const modeloDefeitos = defeitosLista.map((d) => norm(d.MODELO ?? d._model?.modelo ?? ""));
  const existsInDefects = modeloDefeitos.includes(modelo);

  if (existsInDefects) {
    trace.push(`✅ Base de Defeitos: Encontrado no histórico.`);
  } else {
    trace.push(`❌ Base de Defeitos: Nunca apontado antes.`);
    
    // Tenta achar similar nos defeitos
    let bestDefectMatch = { score: 0, name: "" };
    const unicos = Array.from(new Set(modeloDefeitos));
    for (const nome of unicos) {
      const score = levenshteinSimilarity(modelo, nome);
      if (score > bestDefectMatch.score) bestDefectMatch = { score, name: nome };
    }
    
    if (bestDefectMatch.score > 0.45) {
       trace.push(`   ↳ Similar no histórico: "${bestDefectMatch.name}".`);
    }
  }

  // DECISÃO FINAL BASEADA NO RASTREAMENTO
  const fullTraceMsg = trace.join("\n");

  if (!foundInCatalog && !existsInDefects) {
    return {
      motivo: "MODELO_DESCONHECIDO",
      explicacao: `O modelo "${modelo}" não consta no Catálogo Oficial nem no Histórico de Defeitos.\n\n🔍 Rastreio:\n${fullTraceMsg}`
    };
  }

  if (!foundInCatalog && existsInDefects) {
    const existeObj = defeitosLista.find((d) => norm(d.MODELO ?? d._model?.modelo ?? "") === modelo);
    const categoriaDef = norm(existeObj?.CATEGORIA ?? existeObj?._model?.categoria ?? "");
    const categoriaProd = norm(prod.CATEGORIA || "");

    if (categoriaProd && categoriaDef && categoriaProd !== categoriaDef) {
      return {
        motivo: "CATEGORIA_DIVERGENTE",
        explicacao: `Modelo existe no histórico como "${categoriaDef}", mas produção informou "${categoriaProd}".`
      };
    }
  }

  // Se chegou aqui, é um caso estranho (ex: existe mas o loop principal não deu match por algum motivo lógico)
  return {
    motivo: "SEM_DEFEITOS",
    explicacao: `O modelo foi produzido, mas não houve vínculo de defeito direto.\n\n🔍 Rastreio:\n${fullTraceMsg}`
  };
}

// Lemos arquivos extras locais que ainda existirem (como o semi_acabado)
async function readSheet(filename: string) {
  const p = path.join(process.cwd(), "public", "productions", filename);
  const buf = await fs.readFile(p);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet) as Array<any>;
}

export async function GET(req: Request) {
  try {
    // 0) Carrega Catálogos Brutos (Para o Rastreamento Detalhado)
    const rawCatalogs = await loadCatalogo(); 

    // 1) Carrega defeitos enriquecidos
    const cache = await getDefeitosCache({});
    const listaDef = cache.enriched || [];

    // 1.1) Carrega planilha de semi-acabados
    let semiRows: Array<any> = [];
    try {
      const semiPath = path.join(process.cwd(), "public", "productions", "semi_acabado.xlsx");
      await fs.access(semiPath);
      semiRows = await readSheet("semi_acabado.xlsx");
    } catch {
      semiRows = [];
    }

    // 1.2) Monta mapa de semi -> modelo correto
    const semiMap: Map<string, { produto?: string; modeloCorreto?: string }> = new Map();
    for (const s of semiRows) {
      const defeito = norm(s.DEFEITOS_SEM_PRODUCAO ?? s.DEFEITO ?? s.DEF ?? "");
      const produto = String(s.PRODUTO ?? "").toUpperCase().trim();
      const modeloCorreto = norm(s.MODELO_CORRETO ?? s.MODELO_FINAL ?? "");
      if (defeito) semiMap.set(defeito, { produto, modeloCorreto });
    }

    // 2) Índices rápidos para defeitos oficiais
    const indexByModel = new Map<string, any[]>();
    const indexByCodigo = new Map<string, any[]>();

    for (const r of listaDef) {
      const modelo = norm(r.MODELO ?? r._model?.modelo ?? "");
      const codigo = norm(r.CÓDIGO ?? r._model?.codigo ?? "");
      if (modelo) indexByModel.set(modelo, [...(indexByModel.get(modelo) || []), r]);
      if (codigo) indexByCodigo.set(codigo, [...(indexByCodigo.get(codigo) || []), r]);
    }

    // 3) Carrega produção via SQL (Substituindo o antigo Excel)
    const prodRaw = await loadProducao();
    
    if (!Array.isArray(prodRaw)) throw new Error("Produção inválida");

    // ✅ CORREÇÃO: Enviando o TURNO e as novas colunas (TIPO_MOV, FABRICA, etc) para a interface web!
    const rows = prodRaw.map((r, idx) => ({
      __row: idx,
      raw: {
        MODELO: r.MODELO,
        CATEGORIA: r.CATEGORIA,
        QTY_GERAL: r.QTY_GERAL,
        TURNO: r.TURNO, 
        TIPO_MOV: r.TIPO_MOV,
        FABRICA: r.FABRICA,
        TIPO_PROD: r.TIPO_PROD,
        MATNR: r.MATNR,
      },
      DATA: r.DATA,
      QTY_GERAL: r.QTY_GERAL,
      MODELO: norm(r.MODELO),
      CATEGORIA: String(r.CATEGORIA).trim(),
      TURNO: r.TURNO, 
      TIPO_MOV: r.TIPO_MOV,
      FABRICA: r.FABRICA,
      TIPO_PROD: r.TIPO_PROD,
      MATNR: r.MATNR,
    }));

    const totalRows = rows.length;
    const totalVolume = rows.reduce((s, r) => s + (r.QTY_GERAL || 0), 0);

    // 4) Acumuladores
    const categories: Map<string, any> = new Map();
    const notIdentifiedExamplesByModel: Map<string, any> = new Map();
    const producaoPorModelo = new Map<string, { categoria: string; volume: number }>();

    function ensureCat(cat: string) {
      if (!categories.has(cat)) {
        categories.set(cat, {
          rows: 0, volume: 0, identifiedRows: 0, identifiedVolume: 0, 
          notIdentifiedRows: 0, notIdentifiedVolume: 0, models: new Map()
        });
      }
      return categories.get(cat)!;
    }

    // 5) Loop de matching (produção → defeitos)
    for (const r of rows) {
      const cat = ensureCat(r.CATEGORIA || "UNDEF");
      cat.rows++;
      cat.volume += r.QTY_GERAL || 0;

      if (r.MODELO) {
        const obj = producaoPorModelo.get(r.MODELO) || { categoria: r.CATEGORIA, volume: 0 };
        obj.volume += r.QTY_GERAL || 0;
        producaoPorModelo.set(r.MODELO, obj);
      }

      let matched = false;
      const codigoTry = r.MODELO;

      if (codigoTry && indexByCodigo.has(codigoTry)) matched = true;
      if (!matched && indexByModel.has(r.MODELO)) matched = true;

      // Match "Contém"
      if (!matched) {
        for (const defModel of indexByModel.keys()) {
          if (r.MODELO.includes(defModel) && defModel.length > 3) { matched = true; break; }
          if (defModel.includes(r.MODELO) && r.MODELO.length > 3) { matched = true; break; }
        }
      }

      // Match Fuzzy
      let bestModelKey = "";
      let bestScore = 0;
      if (!matched && r.MODELO) {
        for (const m of indexByModel.keys()) {
          const sim = levenshteinSimilarity(r.MODELO, m);
          if (sim > bestScore) { bestScore = sim; bestModelKey = m; }
        }
        if (bestScore > 0.85) matched = true;
      }

      if (matched) {
        cat.identifiedRows++;
        cat.identifiedVolume += r.QTY_GERAL || 0;
        const mk = bestModelKey || r.MODELO || codigoTry || "UNKNOWN";
        const m = cat.models.get(mk) || { identifiedRows: 0, notIdentifiedRows: 0, identifiedVolume: 0, notIdentifiedVolume: 0 };
        m.identifiedRows++;
        m.identifiedVolume += r.QTY_GERAL || 0;
        cat.models.set(mk, m);
      } else {
        cat.notIdentifiedRows++;
        cat.notIdentifiedVolume += r.QTY_GERAL || 0;
        const mk = r.MODELO || "UNKNOWN";
        const m = cat.models.get(mk) || { identifiedRows: 0, notIdentifiedRows: 0, identifiedVolume: 0, notIdentifiedVolume: 0 };
        m.notIdentifiedRows++;
        m.notIdentifiedVolume += r.QTY_GERAL || 0;
        cat.models.set(mk, m);

        const prev = notIdentifiedExamplesByModel.get(mk) || { count: 0, samples: [], explicacoes: [] };
        prev.count++;
        if (prev.samples.length < 5) prev.samples.push(r.raw);
        
        if (prev.explicacoes.length < 1) {
          prev.explicacoes.push(explainMismatch(r, listaDef, rawCatalogs));
        }
        
        notIdentifiedExamplesByModel.set(mk, prev);
      }
    }

    // 6) Construir diagnósticos
    const defeitosPorModelo = new Map<string, number>();
    const semiMapped: Array<any> = [];
    const semiInfo: Array<any> = [];

    for (const d of listaDef) {
      const rawModel = String(d.MODELO ?? d._model?.modelo ?? "");
      const m = norm(rawModel);
      if (!m) continue;

      if (semiMap.has(m)) {
        const mm = semiMap.get(m)!;
        const target = norm(mm.modeloCorreto ?? "");
        if (target) {
          defeitosPorModelo.set(target, (defeitosPorModelo.get(target) || 0) + 1);
          const existing = semiMapped.find(s => s.defeitoOriginal === m);
          if (existing) existing.ocorrencias++;
          else semiMapped.push({ defeitoOriginal: m, modeloCorreto: target, ocorrencias: 1 });
        } else {
          const existing = semiInfo.find(s => s.defeitoOriginal === m);
          if (existing) existing.ocorrencias++;
          else semiInfo.push({ defeitoOriginal: m, modeloCorreto: undefined, motivo: "Semi sem MODELO_CORRETO", ocorrencias: 1 });
        }
      } else {
        defeitosPorModelo.set(m, (defeitosPorModelo.get(m) || 0) + 1);
      }
    }

    // 8) producaoSemDefeitos
    const producaoSemDefeitos: Array<any> = [];
    for (const [modeloProd, info] of producaoPorModelo.entries()) {
      let teveDefeito = false;
      if (defeitosPorModelo.has(modeloProd)) teveDefeito = true;
      else {
        for (const modDef of defeitosPorModelo.keys()) {
          if (modeloProd.includes(modDef)) { teveDefeito = true; break; }
        }
      }
      if (!teveDefeito) {
        producaoSemDefeitos.push({ modelo: modeloProd, categoria: info.categoria, produzido: info.volume });
      }
    }

    // 9) SEGREGAÇÃO (A, B, C)
    const defeitosSemProducao: Array<any> = [];
    const preProducao: Array<any> = [];
    const producaoParcial: Array<any> = [];
    const producaoComDefeitos: Array<any> = [];

    for (const [modeloDefeito, qtd] of defeitosPorModelo.entries()) {
      let temProducao = producaoPorModelo.has(modeloDefeito);
      if (!temProducao) {
        for (const modProd of producaoPorModelo.keys()) {
          if (modProd.includes(modeloDefeito)) { temProducao = true; break; }
        }
      }

      if (temProducao) {
        producaoComDefeitos.push({ modelo: modeloDefeito, ocorrencias: qtd, status: "Fluxo Normal" });
      } else {
        const item = { modelo: modeloDefeito, ocorrenciasDefeitos: qtd };
        if (isErroProposital(modeloDefeito)) {
          defeitosSemProducao.push({ ...item, motivo: "Teste de Validação (Proposital)" });
        } else if (isPreProducao(modeloDefeito)) {
          preProducao.push({ ...item, motivo: "Item ainda em Engenharia/Pré-série/Inconsistente na Produção" });
        } else if (isProducaoParcial(modeloDefeito)) {
          producaoParcial.push({ ...item, motivo: "Placa produzida, Produto final não" });
        } else {
          defeitosSemProducao.push({ ...item, motivo: "Modelo desconhecido sem produção" });
        }
      }
    }

    // 10) divergencias
    const divergencias: Array<any> = [];
    for (const [modelo, info] of producaoPorModelo.entries()) {
      const defeitos = defeitosPorModelo.get(modelo) || 0;
      if (defeitos > info.volume) {
        divergencias.push({
          modelo, categoria: info.categoria, produzido: info.volume, defeitosApontados: defeitos,
          diferenca: defeitos - info.volume, explicacao: "Quantidade de defeitos maior que o volume produzido."
        });
      } else if (info.volume === 0 && defeitos > 0 && isErroProposital(modelo)) {
        divergencias.push({
          modelo, categoria: info.categoria, produzido: info.volume, defeitosApontados: defeitos,
          diferenca: info.volume - defeitos, explicacao: "Foram registrados defeitos para um modelo que declarou 0 produção."
        });
      }
    }

    // 11) INJEÇÃO DE ERROS (CORREÇÃO DE KPI)
    for (const d of defeitosSemProducao) {
      const defOriginal = listaDef.find(item => {
        const m = norm(item.MODELO ?? item._model?.modelo ?? "");
        return m === d.modelo;
      });
      const catNome = norm(defOriginal?.CATEGORIA ?? defOriginal?._model?.categoria ?? "OUTROS");
      const catStats = ensureCat(catNome);
      
      catStats.rows += d.ocorrenciasDefeitos; 
      catStats.notIdentifiedRows += d.ocorrenciasDefeitos;
      
      catStats.models.set(d.modelo, {
        identifiedRows: 0,
        notIdentifiedRows: d.ocorrenciasDefeitos,
        identifiedVolume: 0,
        notIdentifiedVolume: 0
      });
    }

    // 12) perCategory final
    const perCategory = Array.from(categories.entries()).map(
      ([categoria, v]) => ({
        categoria,
        rows: v.rows,
        volume: v.volume,
        identifiedRows: v.identifiedRows,
        notIdentifiedRows: v.notIdentifiedRows,
        identifiedVolume: v.identifiedVolume,
        notIdentifiedVolume: v.notIdentifiedVolume,
        identifiedPct:
          v.rows ? Number(((v.identifiedRows / v.rows) * 100).toFixed(2)) : 0,
        models: Array.from(v.models.entries()).map(([modelKey, stats]: any) => ({
          modelKey,
          ...stats,
          identifyPct:
            stats.identifiedRows + stats.notIdentifiedRows
              ? Number(
                  (
                    (stats.identifiedRows /
                      (stats.identifiedRows + stats.notIdentifiedRows)) *
                    100
                  ).toFixed(2)
                )
              : 0,
        })),
      })
    );

    // 13) topProblemModels
    const topProblemModels = Array.from(notIdentifiedExamplesByModel.entries())
      .map(([modelo, v]: any) => ({
        modelo, count: v.count, samples: v.samples, explicacoes: v.explicacoes,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 14) KPIs
    const totalIdentRows = perCategory.reduce((s, c) => s + c.identifiedRows, 0);
    const totalNotIdentRows = perCategory.reduce((s, c) => s + c.notIdentifiedRows, 0);
    const totalRealRows = totalIdentRows + totalNotIdentRows;

    const totalIdentVol = perCategory.reduce((s, c) => s + (c.identifiedVolume || 0), 0);
    const totalNotIdentVol = perCategory.reduce((s, c) => s + (c.notIdentifiedVolume || 0), 0);

    const payload = {
      ok: true,
      production: rows,
      totals: {
        totalRows,
        totalVolume,
        matchRateByRows:
          totalRealRows ? Number(((totalIdentRows / totalRealRows) * 100).toFixed(2)) : 0,
        matchRateByVolume:
          totalVolume
            ? Number(((totalIdentVol / totalVolume) * 100).toFixed(2))
            : 0,
      },
      perCategory,
      topProblemModels,
      diagnostico: {
        producaoSemDefeitos,
        defeitosSemProducao, 
        preProducao,         
        producaoParcial,     
        producaoComDefeitos, 
        divergencias,
        semiMapped,
        semiInfo,
      },
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error("Erro validate:", e);
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}