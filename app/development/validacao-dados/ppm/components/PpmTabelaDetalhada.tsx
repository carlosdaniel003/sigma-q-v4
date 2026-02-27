"use client";

import "./ppm-tabela-glass.css";
import React from "react";
import { 
  Table, 
  CalendarClock, 
  Factory, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FileBox,
  TrendingDown,
  Activity
} from "lucide-react";

type DiagnosticoReason =
  | "OK"
  | "SEM_DEFEITOS"
  | "DADOS_INCOMPLETOS"
  | "SEM_PRODUCAO"
  | "PPM_ZERADO";

interface Item {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;
  precision: number;
  reason: DiagnosticoReason;
  dataProducao?: string | Date;
  dataDefeito?: string | Date;
}

interface Props {
  items: Item[];
}

/* ======================================================
   UTIL — FORMATA DATA
====================================================== */
function formatDate(value?: string | Date): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "—";
  
  return date.toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
}

/* ======================================================
   UTIL — STATUS BADGE
====================================================== */
function StatusBadge({ reason }: { reason: DiagnosticoReason }) {
    let color = "#94a3b8";
    let bg = "rgba(148, 163, 184, 0.1)";
    let border = "rgba(148, 163, 184, 0.2)";
    let icon = <HelpCircle size={14} />;
    let label = reason.replace(/_/g, " ");

    switch (reason) {
        case "OK":
            color = "#34d399";
            bg = "rgba(16, 185, 129, 0.15)";
            border = "rgba(16, 185, 129, 0.3)";
            icon = <CheckCircle2 size={14} />;
            break;
        case "SEM_DEFEITOS":
            color = "#38bdf8";
            bg = "rgba(56, 189, 248, 0.15)";
            border = "rgba(56, 189, 248, 0.3)";
            icon = <TrendingDown size={14} />;
            break;
        case "SEM_PRODUCAO":
            color = "#f87171";
            bg = "rgba(239, 68, 68, 0.15)";
            border = "rgba(239, 68, 68, 0.3)";
            icon = <AlertCircle size={14} />;
            break;
        case "PPM_ZERADO":
            color = "#fbbf24";
            bg = "rgba(245, 158, 11, 0.15)";
            border = "rgba(245, 158, 11, 0.3)";
            icon = <AlertCircle size={14} />;
            break;
        case "DADOS_INCOMPLETOS":
            color = "#a8a29e";
            bg = "rgba(255, 255, 255, 0.05)";
            border = "rgba(255, 255, 255, 0.1)";
            icon = <FileBox size={14} />;
            break;
    }

    return (
        <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 6, 
            padding: '4px 10px', 
            borderRadius: 8, 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color, 
            background: bg,
            border: `1px solid ${border}`,
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
            boxShadow: `0 0 12px ${bg}`
        }}>
            {icon}
            {label}
        </span>
    );
}

/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */
export default function PpmTabelaDetalhada({ items }: Props) {

  if (items.length === 0) {
    return (
      <div className="ppm-table-empty">
        <div className="ppm-empty-icon">
          <Table size={32} color="#475569" strokeWidth={1.5} />
        </div>
        <h3 className="ppm-empty-title">
            Detalhamento Técnico
        </h3>
        <p className="ppm-empty-sub">
            Nenhum registro encontrado para os filtros atuais. Altere o período ou a categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="ppm-table-container">
      
      {/* HEADER */}
      <div className="ppm-table-header">
          <div className="ppm-table-header-icon">
              <Activity size={20} />
          </div>
          <div>
              <h3 className="ppm-table-title">
                  Tabela Detalhada de PPM
              </h3>
              <p className="ppm-table-subtitle">
                  Análise granular por data, modelo e cruzamento de registros
              </p>
          </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="ppm-table-wrapper custom-scroll">
        <table className="ppm-table">
          
          <thead>
            <tr>
              <th style={thStyle}>Data Ref.</th>
              <th style={thStyle}>Modelo</th>
              <th style={thStyle}>Categoria</th>
              <th style={{...thStyle, textAlign: 'right'}}>Produzido</th>
              <th style={{...thStyle, textAlign: 'right'}}>Defeitos</th>
              <th style={{...thStyle, textAlign: 'right', color: "#ffffff"}}>PPM</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status do Gatilho</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r, index) => {
              const isFromProducao = r.produzido > 0;
              const dataExibida = isFromProducao ? r.dataProducao : r.dataDefeito;

              const OrigemIcon = isFromProducao ? Factory : CalendarClock;
              const origemLabel = isFromProducao ? "Data de Produção" : "Data do Defeito";
              const origemColor = isFromProducao ? "#94a3b8" : "#f87171";

              const rowBg = index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)";

              return (
                <tr 
                  key={r.groupKey}
                  style={{ background: rowBg }}
                >
                  
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>
                            {formatDate(dataExibida)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: origemColor }}>
                            <OrigemIcon size={12} strokeWidth={2.5} />
                            {origemLabel}
                        </div>
                    </div>
                  </td>

                  <td style={{...tdStyle, fontWeight: 700}}>
                      {r.modelo}
                  </td>

                  <td style={{...tdStyle, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                      {r.categoria}
                  </td>

                  <td style={{...tdStyle, textAlign: 'right'}}>
                      {r.produzido.toLocaleString()}
                  </td>

                  <td style={{
                      ...tdStyle, textAlign: 'right',
                      color: r.defeitos > 0 ? '#ef4444' : '#cbd5e1'
                  }}>
                      {r.defeitos.toLocaleString()}
                  </td>

                  <td style={{...tdStyle, textAlign: 'right'}}>
                      {r.ppm > 0 ? (
                          <span className="ppm-highlight">
                              {r.ppm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                      ) : (
                          "0,00"
                      )}
                  </td>

                  <td style={{...tdStyle, textAlign: 'center'}}>
                    <StatusBadge reason={r.reason} />
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}

/* ======================================================
   ESTILOS COMPARTILHADOS
====================================================== */

const thStyle: React.CSSProperties = {
    padding: "16px",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#ffffff",
    fontWeight: 700
};

const tdStyle: React.CSSProperties = {
    padding: "16px",
    verticalAlign: "middle"
};