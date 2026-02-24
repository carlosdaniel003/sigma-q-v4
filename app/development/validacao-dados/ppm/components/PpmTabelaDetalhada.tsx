"use client";

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
  
  // Retorna formato dia/mês/ano para padronização técnica
  return date.toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
}

/* ======================================================
   UTIL — STATUS BADGE (NEON GLASS STYLE)
====================================================== */
function StatusBadge({ reason }: { reason: DiagnosticoReason }) {
    let color = "#94a3b8";
    let bg = "rgba(148, 163, 184, 0.1)";
    let border = "rgba(148, 163, 184, 0.2)";
    let icon = <HelpCircle size={14} />;
    let label = reason.replace(/_/g, " ");

    switch (reason) {
        case "OK":
            color = "#34d399"; // Cyan/Green Neon
            bg = "rgba(16, 185, 129, 0.15)";
            border = "rgba(16, 185, 129, 0.3)";
            icon = <CheckCircle2 size={14} />;
            break;
        case "SEM_DEFEITOS":
            color = "#38bdf8"; // Sky Blue Neon
            bg = "rgba(56, 189, 248, 0.15)";
            border = "rgba(56, 189, 248, 0.3)";
            icon = <TrendingDown size={14} />;
            break;
        case "SEM_PRODUCAO":
            color = "#f87171"; // Red Neon
            bg = "rgba(239, 68, 68, 0.15)";
            border = "rgba(239, 68, 68, 0.3)";
            icon = <AlertCircle size={14} />;
            break;
        case "PPM_ZERADO":
            color = "#fbbf24"; // Yellow/Amber Neon
            bg = "rgba(245, 158, 11, 0.15)";
            border = "rgba(245, 158, 11, 0.3)";
            icon = <AlertCircle size={14} />;
            break;
        case "DADOS_INCOMPLETOS":
            color = "#a8a29e"; // Slate
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
            boxShadow: `0 0 10px ${bg}` // Brilho suave
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
  // ESTADO VAZIO
  if (items.length === 0) {
    return (
      <div style={{ 
          background: "rgba(255, 255, 255, 0.02)", 
          border: "1px dashed rgba(255, 255, 255, 0.1)", 
          borderRadius: 16, 
          padding: 60, 
          textAlign: 'center', 
          marginTop: 20,
          backdropFilter: "blur(10px)"
      }}>
        <div style={{ 
            width: 64, height: 64, 
            borderRadius: 16, 
            background: "rgba(255,255,255,0.03)", 
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px" 
        }}>
            <Table size={32} color="#475569" strokeWidth={1.5} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: "#e2e8f0", marginBottom: 8, letterSpacing: "0.02em" }}>
            Detalhamento Técnico
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Nenhum registro encontrado para os filtros atuais. Altere o período ou a categoria.
        </p>
      </div>
    );
  }

  // TABELA PREENCHIDA (GLASSMORPHISM)
  return (
    <div style={{ 
        marginTop: 24, 
        background: "rgba(15, 23, 42, 0.6)", // Fundo base escuro e translúcido
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: 24,
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
    }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ 
              padding: 8, borderRadius: 10, 
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
              border: "1px solid rgba(59, 130, 246, 0.3)"
          }}>
              <Activity size={20} color="#60a5fa" />
          </div>
          <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.02em" }}>
                  Tabela Detalhada de PPM
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                  Análise granular por data, modelo e cruzamento de registros
              </p>
          </div>
      </div>

      {/* CONTAINER DA TABELA */}
      <div style={{ 
          maxHeight: '500px', 
          overflowY: 'auto',
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.2)" // Fundo da tabela levemente mais escuro para contraste
      }} className="custom-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          
          {/* THEAD COM BLUR */}
          <thead style={{ 
              position: 'sticky', top: 0, zIndex: 10,
              background: "rgba(15, 23, 42, 0.85)", 
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <tr>
              <th style={thStyle}>Data Ref.</th>
              <th style={thStyle}>Modelo</th>
              <th style={thStyle}>Categoria</th>
              <th style={{...thStyle, textAlign: 'right'}}>Produzido</th>
              <th style={{...thStyle, textAlign: 'right'}}>Defeitos</th>
              <th style={{...thStyle, textAlign: 'right', color: "#38bdf8"}}>PPM</th>
              <th style={{...thStyle, textAlign: 'center'}}>Status do Gatilho</th>
            </tr>
          </thead>

          {/* TBODY */}
          <tbody>
            {items.map((r, index) => {
              const isFromProducao = r.produzido > 0;
              const dataExibida = isFromProducao ? r.dataProducao : r.dataDefeito;

              const OrigemIcon = isFromProducao ? Factory : CalendarClock;
              const origemLabel = isFromProducao ? "Data de Produção" : "Data do Defeito";
              const origemColor = isFromProducao ? "#94a3b8" : "#f87171";

              // Listras sutis para facilitar a leitura (zebra striping)
              const rowBg = index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)";

              return (
                <tr key={r.groupKey} style={{ 
                    background: rowBg, 
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    transition: "background 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseOut={(e) => e.currentTarget.style.background = rowBg}
                >
                  
                  {/* DATA COM ORIGEM */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: "#e2e8f0" }}>
                            {formatDate(dataExibida)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: origemColor }}>
                            <OrigemIcon size={12} strokeWidth={2.5} />
                            {origemLabel}
                        </div>
                    </div>
                  </td>

                  {/* MODELO & CATEGORIA */}
                  <td style={{...tdStyle, fontWeight: 700, color: "#f8fafc"}}>
                      {r.modelo}
                  </td>
                  <td style={{...tdStyle, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: "#94a3b8"}}>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4 }}>
                          {r.categoria}
                      </span>
                  </td>

                  {/* NÚMEROS (FONTE MONOSPACE PARA ALINHAMENTO) */}
                  <td style={{...tdStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontSize: "0.95rem", color: "#cbd5e1"}}>
                      {r.produzido.toLocaleString()}
                  </td>
                  <td style={{
                      ...tdStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontSize: "0.95rem", 
                      color: r.defeitos > 0 ? '#ef4444' : '#cbd5e1', fontWeight: r.defeitos > 0 ? 600 : 400
                  }}>
                      {r.defeitos.toLocaleString()}
                  </td>

                  {/* DESTAQUE DO PPM */}
                  <td style={{
                      ...tdStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', 
                      fontSize: "1rem", fontWeight: 700, color: "#e2e8f0"
                  }}>
                      {r.ppm > 0 ? (
                          <span style={{ 
                              background: "rgba(56, 189, 248, 0.1)", 
                              color: "#38bdf8", 
                              padding: "4px 8px", 
                              borderRadius: 6,
                              border: "1px solid rgba(56, 189, 248, 0.2)"
                          }}>
                              {r.ppm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                      ) : (
                          "0,00"
                      )}
                  </td>

                  {/* STATUS */}
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
   ESTILOS COMPARTILHADOS INTERNOS
====================================================== */
const thStyle: React.CSSProperties = {
    padding: "16px",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    fontWeight: 700,
    borderBottom: "1px solid rgba(255,255,255,0.05)"
};

const tdStyle: React.CSSProperties = {
    padding: "16px",
    verticalAlign: "middle"
};