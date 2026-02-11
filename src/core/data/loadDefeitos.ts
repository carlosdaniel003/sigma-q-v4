import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
// ✅ Importamos o Adapter que busca do SQL
import { fetchDefeitosFromSQL } from "./dataAdapter";

export interface DefeitoRaw {
  DATA: any;
  MODELO: string;
  CATEGORIA: string;
  RESPONSABILIDADE: string;
  TURNO: string;
  ANALISE: string;
  QUANTIDADE: number;
  "CÓDIGO DA FALHA"?: string;
  "DESCRIÇÃO DA FALHA"?: string;
  
  // ✅ CAMPO PARA OCORRÊNCIAS
  "CÓDIGO DO FORNECEDOR"?: string;

  // ✅ NOVO CAMPO: Posição Mecânica (Exatamente como no Excel)
  "REFERÊNCIA/POSIÇÃO MECÂNICA"?: string;
}

// ✅ Função agora é ASYNC para permitir o fetch
export async function loadDefeitos(): Promise<DefeitoRaw[]> {
  try {
    // 1. Tenta buscar do SQL (via Ponte PHP)
    const dadosSQL = await fetchDefeitosFromSQL();

    if (dadosSQL && dadosSQL.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`📡 [LoadDefeitos] Usando SQL (${dadosSQL.length} registros)`);
      return dadosSQL;
    }
  } catch (err) {
    console.warn("⚠️ [LoadDefeitos] Falha no SQL, usando fallback Excel:", err);
  }

  // 2. Fallback: Lê o arquivo Excel local (Comportamento original)
  // eslint-disable-next-line no-console
  console.log("📂 [LoadDefeitos] Usando Excel Local (Fallback)");
  
  const filePath = path.join(
    process.cwd(),
    "public",
    "defeitos",
    "defeitos_produto_acabado.xlsx"
  );

  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet) as DefeitoRaw[];
}