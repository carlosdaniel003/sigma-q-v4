import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export interface ProducaoRaw {
  DATA: any;
  MODELO: string;
  CATEGORIA: string;
  TURNO: string; // ✅ Novo Campo Obrigatório
  QTY_GERAL: number;
}

export function loadProducao(): ProducaoRaw[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "productions",
      "producao.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

    // 🛡️ FILTRO DE ANO 2026
    const filteredData = rawData.filter((r) => {
      let dataObj: Date | null = null;

      // Tratamento de datas do Excel
      if (typeof r["DATA"] === "number") {
         dataObj = new Date((r["DATA"] - (25567 + 1)) * 86400 * 1000); 
      } else if (typeof r["DATA"] === "string") {
         dataObj = new Date(r["DATA"]);
      } else if (r["DATA"] instanceof Date) {
         dataObj = r["DATA"];
      }

      if (!dataObj || isNaN(dataObj.getTime())) return false;
      return dataObj.getFullYear() === 2026;
    });

    const discarded = rawData.length - filteredData.length;
    if (discarded > 0) {
        // eslint-disable-next-line no-console
        console.log(`🧹 [LoadProducao] ${discarded} registros ignorados. Mantidos: ${filteredData.length} (2026).`);
    }

    return filteredData.map((r) => ({
      DATA: r["DATA"],
      MODELO: String(r["MODELO"] || "").trim().toUpperCase(),
      CATEGORIA: String(r["CATEGORIA"] || "").trim().toUpperCase(),
      // ✅ Normalização de Turno
      TURNO: String(r["TURNO"] || "GERAL").trim().toUpperCase(), 
      QTY_GERAL: Number(r["QTY_GERAL"] || 0),
    }));
  } catch (error) {
    console.error("❌ Erro ao carregar producao.xlsx:", error);
    return [];
  }
}