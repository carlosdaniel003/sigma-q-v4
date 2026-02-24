import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export interface PlanoAcao {
  codDefeito: string;
  categoria: string;
  analise: string;
  descMotivo: string;
  causaRaiz: string;
  acao: string;         // ✅ NOVO CAMPO
  responsavel: string;  // ✅ NOVO CAMPO
}

let CACHE_PLANOS: PlanoAcao[] | null = null;

export function loadPlanosAcao(): PlanoAcao[] {
  if (CACHE_PLANOS) return CACHE_PLANOS;

  try {
    const filePath = path.join(process.cwd(), "public", "suporte", "planos_de_acao.xlsx");
    
    if (!fs.existsSync(filePath)) {
      console.warn("⚠️ [loadPlanosAcao] Arquivo não encontrado:", filePath);
      return [];
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Mapeamento à prova de balas
    CACHE_PLANOS = data.map((rawRow: any) => {
      
      const row: any = {};
      for (const key in rawRow) {
        // Normaliza as chaves removendo espaços e deixando maiúsculo
        const cleanKey = key.toUpperCase().trim();
        row[cleanKey] = rawRow[key];
      }

      return {
        codDefeito: String(row["COD.DEFEITO"] || row["COD_DEFEITO"] || row["CODIGO"] || "").trim().toUpperCase(),
        categoria: String(row["CATEGORIA"] || "").trim().toUpperCase(),
        
        // Pega as colunas com várias possibilidades de nome no Excel
        analise: String(row["ANÁLISE"] || row["ANALISE"] || "").trim(),
        descMotivo: String(row["DESC.MOTIVO"] || row["DESC MOTIVO"] || row["MOTIVO"] || "").trim(),
        causaRaiz: String(row["CAUSA RAIZ"] || row["CAUSA"] || row["CAUSA_RAIZ"] || "").trim(),
        
        // ✅ NOVOS CAMPOS MAPEADOS
        acao: String(row["AÇÃO"] || row["ACAO"] || row["PLANO DE AÇÃO"] || row["PLANO DE ACAO"] || "").trim(),
        responsavel: String(row["RESPONSÁVEL"] || row["RESPONSAVEL"] || row["RESP"] || "").trim(),
      };
    }).filter(p => p.codDefeito && p.categoria);

    return CACHE_PLANOS;
  } catch (err) {
    console.error("❌ [loadPlanosAcao] Erro ao ler Excel:", err);
    return [];
  }
}