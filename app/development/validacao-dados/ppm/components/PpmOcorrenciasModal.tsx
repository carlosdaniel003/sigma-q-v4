"use client";

import React from "react";
import { XMarkIcon, ExclamationTriangleIcon, CalendarIcon, CubeIcon, MapPinIcon, WrenchScrewdriverIcon, HashtagIcon } from "@heroicons/react/24/outline";

// Tipagem baseada no que vem do fetchOcorrenciasFromSQL
interface OcorrenciaItem {
  DATA: string | Date;
  MODELO: string;
  LINHA: string;
  TÉCNICO: string;
  CATEGORIA: string;
  "CÓDIGO DA FALHA": string;
  "DESCRIÇÃO DA FALHA": string;
  "REFERÊNCIA/POSIÇÃO MECÂNICA"?: string;
  ANALISE?: string;
  QUANTIDADE: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  code: string | null;
  items: OcorrenciaItem[];
}

// Helper visual para intensidade da quantidade
const getSeverityColor = (qtd: number) => {
    if (qtd >= 10) return { bg: "rgba(239, 68, 68, 0.15)", text: "#FCA5A5", border: "rgba(239, 68, 68, 0.3)" }; // Alto (Red)
    if (qtd >= 5) return { bg: "rgba(245, 158, 11, 0.15)", text: "#FCD34D", border: "rgba(245, 158, 11, 0.3)" }; // Médio (Amber)
    return { bg: "rgba(59, 130, 246, 0.15)", text: "#93C5FD", border: "rgba(59, 130, 246, 0.3)" }; // Baixo (Blue)
};

export default function PpmOcorrenciasModal({ isOpen, onClose, code, items }: Props) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={glassModalStyle} className="ppm-fade-in">
        
        {/* Header com o Gradiente Específico */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={iconContainerStyle}>
              <ExclamationTriangleIcon width={24} className="text-amber-400" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#fff", fontWeight: 700, letterSpacing: "-0.01em" }}>
                Ocorrência <span style={{ color: "#FBBF24" }}>{code}</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={badgeCountStyle}>{items.length} Registros</span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>na base filtrada</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={closeButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <XMarkIcon width={20} />
          </button>
        </div>

        {/* Tabela com Scroll */}
        <div style={contentStyle}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "0.85rem" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Modelo / Linha</th>
                <th style={thStyle}>Descrição da Falha</th>
                <th style={thStyle}>Análise / Causa</th>
                <th style={thStyle}>Ref.</th>
                <th style={{...thStyle, textAlign: "center"}}>Qtd</th>
                <th style={{...thStyle, textAlign: "right"}}>Técnico</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const severity = getSeverityColor(item.QUANTIDADE);
                const refMecanica = item["REFERÊNCIA/POSIÇÃO MECÂNICA"] || "-";
                const analise = item.ANALISE || "Não Informado";

                return (
                  <tr 
                    key={idx} 
                    style={rowStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* DATA */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
                        <CalendarIcon width={14} />
                        {new Date(item.DATA).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </div>
                      <div style={{ marginTop: 4 }}>
                         <span style={{ 
                              background: "rgba(255,255,255,0.05)", 
                              padding: "2px 6px", 
                              borderRadius: 4, 
                              fontSize: "0.7rem", 
                              color: "#64748b",
                              border: "1px solid rgba(255,255,255,0.05)"
                          }}>
                            {item.CATEGORIA}
                          </span>
                      </div>
                    </td>

                    {/* MODELO / LINHA */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <CubeIcon width={14} color="#60A5FA" />
                        <span style={{ color: "#fff", fontWeight: 500 }}>{item.MODELO}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "0.75rem" }}>
                            <MapPinIcon width={12} />
                            {item.LINHA}
                        </div>
                    </td>

                    {/* DESCRIÇÃO DA FALHA */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ 
                                color: "#FCD34D", 
                                fontWeight: 600, 
                                fontSize: "0.75rem", 
                                background: "rgba(245, 158, 11, 0.1)", 
                                padding: "1px 6px", 
                                borderRadius: 4 
                            }}>
                                {item["CÓDIGO DA FALHA"]}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: 4, lineHeight: 1.4, opacity: 0.9 }}>
                              {item["DESCRIÇÃO DA FALHA"]}
                          </span>
                      </div>
                    </td>

                    {/* ANÁLISE */}
                    <td style={tdStyle}>
                         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <WrenchScrewdriverIcon width={14} color="#A78BFA" />
                            <span style={{ color: "#E2E8F0", fontSize: "0.8rem" }}>
                                {analise}
                            </span>
                        </div>
                    </td>

                    {/* REFERÊNCIA */}
                    <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                             <HashtagIcon width={12} color="#64748b" />
                             <span style={{ 
                                fontFamily: "monospace", 
                                background: "rgba(0,0,0,0.3)", 
                                padding: "2px 6px", 
                                borderRadius: 4, 
                                color: "#94a3b8",
                                fontSize: "0.75rem"
                             }}>
                                {refMecanica}
                             </span>
                        </div>
                    </td>

                    {/* QUANTIDADE */}
                    <td style={{...tdStyle, textAlign: "center"}}>
                      <span style={{ 
                          background: severity.bg, 
                          color: severity.text, 
                          border: `1px solid ${severity.border}`,
                          padding: "3px 10px", 
                          borderRadius: 6, 
                          fontSize: "0.8rem", 
                          fontWeight: 700,
                          minWidth: 32,
                          display: "inline-block"
                      }}>
                        {item.QUANTIDADE}
                      </span>
                    </td>

                    {/* TÉCNICO */}
                    <td style={{...tdStyle, textAlign: "right", color: "#64748b", fontSize: "0.8rem"}}>
                      {item.TÉCNICO}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   STYLES (GLASSMORPHISM AJUSTADO PARA REFERÊNCIA)
====================================================== */

const overlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0, 0, 0, 0.8)", 
  backdropFilter: "blur(6px)",
  zIndex: 9999, 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center",
  animation: "fadeIn 0.2s ease-out"
};

const glassModalStyle: React.CSSProperties = {
  background: "#0f172a", 
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 16, 
  width: "95%",
  maxWidth: 1200, 
  height: "85vh",
  display: "flex", 
  flexDirection: "column", 
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset",
  overflow: "hidden"
};

const headerStyle: React.CSSProperties = {
  padding: "20px 24px", 
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
};

const iconContainerStyle: React.CSSProperties = {
  width: 48, 
  height: 48, 
  borderRadius: 12, 
  background: "rgba(255, 255, 255, 0.05)", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const badgeCountStyle: React.CSSProperties = {
    background: "#3B82F6", 
    color: "#fff", 
    padding: "2px 8px", 
    borderRadius: 6, 
    fontSize: "0.7rem", 
    fontWeight: 700,
    letterSpacing: "0.5px"
};

const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", 
  border: "1px solid rgba(255,255,255,0.05)", 
  color: "#94a3b8", 
  cursor: "pointer", 
  padding: 8,
  borderRadius: 8,
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const contentStyle: React.CSSProperties = {
  flex: 1, 
  overflowY: "auto", 
  padding: 0,
  background: "transparent"
};

const thStyle: React.CSSProperties = { 
    padding: "14px 20px",
    fontWeight: 600, 
    fontSize: "0.75rem", 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    color: "#64748b",
    background: "#0f172a", 
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    textAlign: "left",
    whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = { 
    padding: "14px 20px", 
    color: "#e2e8f0", 
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    verticalAlign: "top"
};

const rowStyle: React.CSSProperties = {
    transition: "background 0.2s"
};