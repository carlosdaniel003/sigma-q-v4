import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
// ✅ Importamos o Adapter que busca do SQL
import { fetchDefeitosFromSQL } from "./dataAdapter";

/* ======================================================
   TIPAGEM: DefeitoRaw
   Contém os campos do Excel e os novos campos do SQL
   necessários para o Drawer de Detalhes.
====================================================== */
export interface DefeitoRaw {
  ID?: string | number;         // SQL
  DATA: any;                    // Excel/SQL
  HORA?: string;                // SQL
  MODELO: string;               // Excel/SQL
  CATEGORIA: string;            // Excel/SQL
  RESPONSABILIDADE: string;     // Excel/SQL
  TURNO: string;                // Excel/SQL
  ANALISE: string;              // Excel/SQL
  QUANTIDADE: number;           // Excel/SQL
  TÉCNICO?: string;             // SQL
  OBSERVACAO?: string;          // SQL
  CODIGO_MOTIVO?: string;       // SQL
  POSICAO_MECANICA?: string;    // SQL
  COMPONENTE?: string;          // SQL
  
  "CÓDIGO DA FALHA"?: string;   // Excel
  "DESCRIÇÃO DA FALHA"?: string; // Excel
  
  // ✅ CAMPO PARA OCORRÊNCIAS
  "CÓDIGO DO FORNECEDOR"?: string; // Excel/SQL

  // ✅ NOVO CAMPO: Posição Mecânica (Exatamente como no Excel)
  "REFERÊNCIA/POSIÇÃO MECÂNICA"?: string;
}

/**
 * Função principal para carregamento de dados.
 * Prioriza o SQL e utiliza o Excel como contingência.
 */
export async function loadDefeitos(): Promise<DefeitoRaw[]> {
  try {
    // 1. Tenta buscar do SQL (via Ponte PHP / dataAdapter)
    const dadosSQL = await fetchDefeitosFromSQL();

    if (dadosSQL && dadosSQL.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`📡 [LoadDefeitos] Usando SQL (${dadosSQL.length} registros)`);
      return dadosSQL;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ [LoadDefeitos] Falha no SQL, usando fallback Excel:", err);
  }

  // 2. Fallback: Lê o arquivo Excel local (Comportamento original preservado)
  try {
    // eslint-disable-next-line no-console
    console.log("📂 [LoadDefeitos] Usando Excel Local (Fallback)");
    
    const filePath = path.join(
      process.cwd(),
      "public",
      "defeitos",
      "defeitos_produto_acabado.xlsx"
    );

    // Verifica se o arquivo existe para evitar quebra de execução
    if (!fs.existsSync(filePath)) {
      console.error("❌ [LoadDefeitos] Arquivo Excel não encontrado em:", filePath);
      return [];
    }

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet) as DefeitoRaw[];
  } catch (excelErr) {
    console.error("❌ [LoadDefeitos] Erro crítico ao ler Excel:", excelErr);
    return [];
  }
}