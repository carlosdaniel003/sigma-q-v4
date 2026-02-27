import React from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportarExcelProducaoProps {
  baseProducao: any[];
}

export default function ExportarExcelProducao({ baseProducao }: ExportarExcelProducaoProps) {
  const handleDownloadExcel = () => {
    if (!baseProducao || baseProducao.length === 0) {
      alert("Nenhum dado de produção disponível para exportação.");
      return;
    }

    // 1. Prepara os dados limpos respeitando a ordem e as novas colunas
    const dadosExcel = baseProducao.map((row: any) => ({
      DATA: row.DATA ? new Date(row.DATA).toLocaleDateString("pt-BR") : "",
      QTY_GERAL: row.QTY_GERAL || 0,
      MODELO: row.MODELO || "",
      CATEGORIA: row.CATEGORIA || "",
      TURNO: row.TURNO || "C",
      // ✅ Injetando as novas colunas do SAP
      MATNR: row.MATNR || "",
      TIPO_PROD: row.TIPO_PROD || "",
      FABRICA: row.FABRICA || "",
      TIPO_MOV: row.TIPO_MOV || "",
    }));

    // 2. Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Producao");

    // 3. Força o download
    XLSX.writeFile(workbook, `Producao_SIGMA-Q_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`);
  };

  return (
    <button 
      onClick={handleDownloadExcel}
      className="btn-export-excel"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      }}
      title="Baixar Base de Produção em Excel"
    >
      <Download size={14} />
      EXPORTAR EXCEL BRUTO
    </button>
  );
}