"use client";

import React, { useMemo, useState } from "react";
import { TurnoStats, DetailRow } from "../hooks/useDashboard";
// ✅ Importação do Drawer
import DefectDetailsDrawer, { DefectDetailRow } from "../../diagnostico/components/DefectDetailsDrawer";

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
  return ppmValue > meta ? "#EF4444" : "#22C55E";
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
  // ✅ Estado tipado corretamente para o Drawer
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
            // ✅ CORREÇÃO AQUI: Mapeia o campo ANALISE corretamente
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

        {/* ✅ Componente do Drawer corrigido */}
        <DefectDetailsDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            rows={mappedRows} // ✅ Agora passa 'rows' com os dados formatados
            title={selectedTitle}
            loading={false}
        />
    </>
  );
}

function TurnoTable({ stats, label, onRowClick }: { stats: TurnoStats; label: string; onRowClick: (r: DetailRow) => void }) {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff", fontWeight: 700 }}>
          DETALHAMENTO OPERACIONAL ({label}) - {stats.turno}
        </h3>
        <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
          Produção: <strong>{stats.producao.toLocaleString("pt-BR")}</strong> | 
          Defeitos: <strong style={{ color: "#EF4444" }}>{stats.totalDefeitos}</strong>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "#e2e8f0" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={thStyle}>TIPO</th>
              <th style={thStyle}>COD</th>
              <th style={thStyle}>MODELO</th>
              <th style={thStyle}>DESCRIÇÃO DA FALHA</th>
              <th style={thStyle}>PEÇA / PLACA</th>
              <th style={thStyle}>REF / POSIÇÃO</th>
              <th style={thStyle}>ANÁLISE</th>
              <th style={thStyleCenter}>QTD</th>
              <th style={thStyleCenter}>PPM</th>
            </tr>
          </thead>
          <tbody>
            {stats.groups.length === 0 ? (
                <tr>
                    <td colSpan={9} style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                        Nenhum registro encontrado neste turno para o período selecionado.
                    </td>
                </tr>
            ) : (
                stats.groups.map((group) => (
                    <React.Fragment key={group.responsibility}>
                        <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td colSpan={9} style={{ 
                                padding: "8px 16px", 
                                fontWeight: "bold", 
                                color: "#60A5FA", 
                                textTransform: "uppercase", 
                                fontSize: "0.8rem", 
                                letterSpacing: "0.05em",
                                textAlign: "center" 
                            }}>
                                {group.responsibility}
                            </td>
                        </tr>
                        
                        {group.top3.map((row, idx) => (
                            <tr 
                                key={`${group.responsibility}-${idx}`} 
                                onClick={() => onRowClick(row)} 
                                style={{ 
                                    borderBottom: "1px solid rgba(255,255,255,0.05)", 
                                    background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                                    cursor: "pointer", 
                                    transition: "background 0.2s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"}
                            >
                                <td style={tdStyle}>
                                  <span style={{
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    background: row.isOcorrencia ? "rgba(59, 130, 246, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    color: row.isOcorrencia ? "#60A5FA" : "#EF4444",
                                    border: `1px solid ${row.isOcorrencia ? "rgba(59, 130, 246, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                                  }}>
                                    {row.isOcorrencia ? "OCOR" : "DEF"}
                                  </span>
                                </td>

                                <td style={tdStyle}>{row.cod}</td>
                                <td style={{ ...tdStyle, color: "#93C5FD", fontWeight: 600 }}>{row.modelo}</td>
                                <td style={tdStyle}>{row.falha}</td>
                                <td style={tdStyle}>{row.peca}</td>
                                <td style={tdStyle}>{row.ref}</td>
                                <td style={tdStyle}>{row.analise}</td>
                                <td style={{ ...tdStyleCenter, color: "#fff", fontWeight: "bold" }}>{row.qtd}</td>
                                
                                <td style={{ 
                                    ...tdStyleCenter, 
                                    color: getPpmColor(row.ppm, (row as any).categoria, row.isOcorrencia), 
                                    fontWeight: "bold"
                                }}>
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

const containerStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
};

const headerStyle: React.CSSProperties = {
  padding: "16px 20px",
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" };
const thStyleCenter: React.CSSProperties = { ...thStyle, textAlign: "center" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", whiteSpace: "nowrap" };
const tdStyleCenter: React.CSSProperties = { ...tdStyle, textAlign: "center" };