import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { DefeitoRaw } from "./loadDefeitos";
import { norm } from "../diagnostico/diagnosticoUtils";
// ✅ Importamos as traduções para a inteligência saber se o código passou limpo ou foi traduzido
import { CAUSA_TRANSLATION, DEFEITO_TRANSLATION } from "./constants/sigmaTranslations";

export interface AgrupamentoRow {
  ANALISE: string;
  AGRUPAMENTO: string;
}

export function loadAgrupamento(): AgrupamentoRow[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "suporte",
      "agrupamento_analise.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

    const mappedData = rawData.map((row) => ({
      ANALISE: row["ANÁLISE"] || row["ANALISE"] || "",
      AGRUPAMENTO: row["AGRUPAMENTO"] || "NÃO CLASSIFICADO",
    }));

    return mappedData;
  } catch (error) {
    console.error("❌ Erro ao carregar agrupamento_analise.xlsx:", error);
    return [];
  }
}

/* ======================================================
   🧠 INTELIGÊNCIA ARTIFICIAL (HEURÍSTICA DE TEXTO)
   Diferencia um "Código Cru" de uma "Descrição Faltante"
====================================================== */
function pareceCodigoCru(texto: string): boolean {
  const limpo = texto.trim();
  
  // 1. Se tem espaço, é uma frase/descrição legível (ex: "SOLDA FRIA")
  if (limpo.includes(" ")) return false;
  
  // 2. Se tem caracteres de descrição, não é código (ex: "ATERRADO(A)")
  if (limpo.includes("(") || limpo.includes(")") || limpo.includes("/") || limpo.includes("-")) {
      return false;
  }
  
  // 3. Códigos crus costumam ter 5 caracteres ou menos (ex: "GTRA", "C01")
  if (limpo.length <= 5) return true;
  
  return false;
}

/* ======================================================
   🔍 FUNÇÃO DE AUDITORIA COM INTELIGÊNCIA DE ARQUIVO
====================================================== */
export function auditarNaoClassificados(defeitosBanco: DefeitoRaw[]): {
  lista: {
    analise: string;
    motivo: "NAO_MAPEADO" | "SEM_AGRUPAMENTO";
    ocorrencias: number;
    modelosAfetados: string[];
    ultimaOcorrencia: Date | null;
  }[];
  totalOcorrenciasNaoClassificadas: number; // ✅ Campo para afetar o KPI Global
} {
  
  // 1. Carrega o dicionário Excel atual
  const dicionario = loadAgrupamento();
  const mapAgrupamento = new Map<string, string>();
  
  dicionario.forEach((r) => {
    mapAgrupamento.set(norm(r.ANALISE), norm(r.AGRUPAMENTO));
  });

  // 2. Mapeia todos os nomes que o sigmaTranslations.ts conhece
  const nomesTraduzidos = new Set<string>();
  Object.values(CAUSA_TRANSLATION).forEach(v => nomesTraduzidos.add(norm(String(v))));
  Object.values(DEFEITO_TRANSLATION).forEach(v => nomesTraduzidos.add(norm(String(v))));

  const rastreio = new Map<string, { 
    count: number, 
    modelos: Set<string>, 
    ultimaData: Date | null,
    motivo: "NAO_MAPEADO" | "SEM_AGRUPAMENTO"
  }>();

  let totalSomadoNaoClassificados = 0;

  // 3. Varre o banco de dados
  defeitosBanco.forEach((d) => {
    const chaveAnalise = norm(d.ANALISE); 
    
    if (!chaveAnalise) return;

    const agrupamento = mapAgrupamento.get(chaveAnalise);

    // Se está "órfão" (sem agrupamento no excel ou marcado como não classificado)
    if (!agrupamento || agrupamento === "NAO CLASSIFICADO" || agrupamento === "NÃO CLASSIFICADO" || agrupamento === "") {
      
      const qtd = Number(d.QUANTIDADE) || 1;
      totalSomadoNaoClassificados += qtd; // ✅ Alimenta a soma global

      if (!rastreio.has(chaveAnalise)) {
        let motivoDefinido: "NAO_MAPEADO" | "SEM_AGRUPAMENTO" = "SEM_AGRUPAMENTO";

        if (nomesTraduzidos.has(chaveAnalise)) {
            motivoDefinido = "SEM_AGRUPAMENTO";
        } else {
            if (pareceCodigoCru(d.ANALISE || "")) {
                motivoDefinido = "NAO_MAPEADO";
            } else {
                motivoDefinido = "SEM_AGRUPAMENTO";
            }
        }
        
        rastreio.set(chaveAnalise, { count: 0, modelos: new Set(), ultimaData: null, motivo: motivoDefinido });
      }

      const item = rastreio.get(chaveAnalise)!;
      item.count += qtd;
      if (d.MODELO) item.modelos.add(d.MODELO);

      const dData = d.DATA instanceof Date ? d.DATA : new Date(d.DATA);
      if (!isNaN(dData.getTime())) {
        if (!item.ultimaData || dData > item.ultimaData) {
          item.ultimaData = dData;
        }
      }
    }
  });

  const lista = Array.from(rastreio.entries()).map(([analise, dados]) => ({
    analise,
    motivo: dados.motivo,
    ocorrencias: dados.count,
    modelosAfetados: Array.from(dados.modelos),
    ultimaOcorrencia: dados.ultimaData
  })).sort((a, b) => b.ocorrencias - a.ocorrencias);

  return {
    lista,
    totalOcorrenciasNaoClassificadas: totalSomadoNaoClassificados
  };
}