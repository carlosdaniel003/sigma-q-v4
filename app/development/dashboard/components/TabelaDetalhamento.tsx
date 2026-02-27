"use client";

import React, { useMemo, useState } from "react";
import { TurnoStats, DetailRow } from "../hooks/useDashboard";
import DefectDetailsDrawer, { DefectDetailRow } from "../../diagnostico/components/DefectDetailsDrawer";

import "./TabelaDetalhamento-glass.css"; // ✅ NOVO CSS IMPORTADO

interface Props {
  data: TurnoStats[];
  filterLabel: string;
}

// ✅ Metas Oficiais por Categoria
const METAS_POR_CATEGORIA: Record<string, number> = {
  "ARCON": 3600,   
  "BBS": 7820,     
  "CM": 5870,      
  "MWO": 1730,     
  "TM": 11680,     
  "TV": 6870,      
  "TW": 11680,     
  "GERAL": 5200    
};

function getPpmColor(ppmValue: number, categoria?: string, isOcorrencia?: boolean) {
  if (isOcorrencia) return "#60A5FA"; 
  const cat = String(categoria || "").toUpperCase().trim();
  const meta = METAS_POR_CATEGORIA[cat] ?? METAS_POR_CATEGORIA["GERAL"];
  return ppmValue > meta ? "#EF4444" : "#22C55E"; // Vermelho vs Verde suavizado
}

// ✅ Função auxiliar para formatar data (compatível com string SQL ou Date)
function formatDate(val: any): string {
    if (!val) return "-";
    try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString("pt-BR");
    } catch {
        return String(val);
    }
}

export default function TabelaDetalhamento({ data, filterLabel }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mappedRows, setMappedRows] = useState<DefectDetailRow[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  
  if (!data || data.length === 0) return null;

  // ✅ Handler: Mapeia dados brutos para o formato do Drawer
  const handleRowClick = (row: DetailRow) => {
    if (row.originalRows && row.originalRows.length > 0) {
        
        // Mapeamento Chave: SQL -> Drawer Props
        const formattedRows: DefectDetailRow[] = row.originalRows.map((item: any) => ({
            id: item.ID || Math.random(),
            data: formatDate(item.DATA),
            hora: item.HORA || "-",
            tecnico: item.TÉCNICO || item.TECNICO || "N/A",
            modelo: item.MODELO,
            posicao: item["REFERÊNCIA/POSIÇÃO MECÂNICA"] || item.REFERENCIA || item.POSICAO_MECANICA || "-",
            motivoCod: item["CÓDIGO DO FORNECEDOR"] || item.CODIGO_MOTIVO || item.cod_mot || "-",
            motivoDesc: item.RESPONSABILIDADE || "-",
            observacao: item.OBSERVACAO || "",
            componente: item["PEÇA/PLACA"] || item.COMPONENTE || "-",
            sintoma: item["DESCRIÇÃO DA FALHA"] || item.DEFEITO || "-",
            causa: item.ANALISE || item.CAUSA || item["ANÁLISE"] || "Não informada",
            linha: item.LINHA || "-",
            quantidade: Number(item.QUANTIDADE || 1)
        }));

        setMappedRows(formattedRows);
        setSelectedTitle(`${row.isOcorrencia ? "OCORRÊNCIA" : "DEFEITO"}: ${row.falha} - ${row.modelo}`);
        setDrawerOpen(true);
    }
  };

  const formatTitleDate = (label: string) => {
      if (label.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parts = label.split("-");
          return `${parts[2]}/${parts[1]}/${parts[0]}`; 
      }
      return label; 
  };

  const sortedData = useMemo(() => {
      return [...data].sort((a, b) => {
          const turnoA = a.turno.toLowerCase();
          const turnoB = b.turno.toLowerCase();
          if (turnoA.includes("comercial")) return -1;
          if (turnoB.includes("comercial")) return 1;
          return turnoA.localeCompare(turnoB);
      });
  }, [data]);

  return (
    <>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 24 }}>
        {sortedData.map((turnoData) => (
            <TurnoTable 
                key={turnoData.turno} 
                stats={turnoData} 
                label={formatTitleDate(filterLabel)}
                onRowClick={handleRowClick} 
            />
        ))}
        </div>

        <DefectDetailsDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            rows={mappedRows}
            title={selectedTitle}
            loading={false}
        />
    </>
  );
}

/* ======================================================
   SUBCOMPONENTE DA TABELA
====================================================== */
function TurnoTable({ stats, label, onRowClick }: { stats: TurnoStats; label: string; onRowClick: (r: DetailRow) => void }) {
  return (
    <div className="tabela-detalhe-container">
      
      {/* CABEÇALHO */}
      <div className="tabela-header">
        <h3 className="tabela-title">
          DETALHAMENTO OPERACIONAL ({label}) - {stats.turno}
        </h3>
        <div className="tabela-kpis">
          Produção: <strong>{stats.producao.toLocaleString("pt-BR")}</strong> | 
          Defeitos: <strong className="text-danger">{stats.totalDefeitos}</strong>
        </div>
      </div>

      {/* CORPO DA TABELA */}
      <div className="tabela-wrapper">
        <table className="tabela-core">
          <thead>
            <tr>
              <th>TIPO</th>
              <th>COD</th>
              <th>MODELO</th>
              <th>DESCRIÇÃO DA FALHA</th>
              <th>PEÇA / PLACA</th>
              <th>REF / POSIÇÃO</th>
              <th>ANÁLISE</th>
              <th className="center">QTD</th>
              <th className="center">PPM</th>
            </tr>
          </thead>
          <tbody>
            {stats.groups.length === 0 ? (
                <tr>
                    <td colSpan={9} className="tabela-empty">
                        Nenhum registro encontrado neste turno para o período selecionado.
                    </td>
                </tr>
            ) : (
                stats.groups.map((group) => (
                    <React.Fragment key={group.responsibility}>
                        
                        {/* Linha de Agrupamento */}
                        <tr className="tabela-row-group">
                            <td colSpan={9}>
                                {group.responsibility}
                            </td>
                        </tr>
                        
                        {/* Linhas de Dados */}
                        {group.top3.map((row, idx) => (
                            <tr 
                                key={`${group.responsibility}-${idx}`} 
                                onClick={() => onRowClick(row)} 
                                className="tabela-row-data"
                            >
                                <td>
                                  <span className={`badge-tipo ${row.isOcorrencia ? "badge-ocorrencia" : "badge-defeito"}`}>
                                    {row.isOcorrencia ? "OCOR" : "DEF"}
                                  </span>
                                </td>

                                <td>{row.cod}</td>
                                <td className="td-modelo">{row.modelo}</td>
                                <td>{row.falha}</td>
                                <td>{row.peca}</td>
                                <td>{row.ref}</td>
                                <td>{row.analise}</td>
                                <td className="center td-qtd">{row.qtd}</td>
                                
                                <td 
                                  className="center td-ppm"
                                  style={{ color: getPpmColor(row.ppm, (row as any).categoria, row.isOcorrencia) }}
                                >
                                    {row.ppm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}