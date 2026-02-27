"use client";
import "./ppm-ocorrencias-modal-glass.css";
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
    <div className="ppm-modal-overlay">
      <div className="ppm-modal-glass">
        
        {/* Header com o Gradiente Específico */}
        <div className="ppm-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.15)", 
              display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59,130,246,0.25)"
            }}>
              <ExclamationTriangleIcon width={24} className="text-amber-400" color="#FBBF24" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#fff", fontWeight: 700, letterSpacing: "-0.01em" }}>
                Ocorrência <span style={{ color: "#FBBF24" }}>{code}</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{
                    background: "linear-gradient(90deg,#2563EB,#3B82F6)", color: "#fff", padding: "3px 10px", 
                    borderRadius: 8, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px", boxShadow: "0 4px 12px rgba(37,99,235,0.4)"
                }}>
                  {items.length} Registros
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>na base filtrada</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="ppm-modal-close">
            <XMarkIcon width={20} />
          </button>
        </div>

        {/* Tabela com Scroll */}
        <div className="ppm-modal-content">
          <table className="ppm-modal-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Modelo / Linha</th>
                <th>Descrição da Falha</th>
                <th>Análise / Causa</th>
                <th>Ref.</th>
                <th style={{ textAlign: "center" }}>Qtd</th>
                <th style={{ textAlign: "right" }}>Técnico</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const severity = getSeverityColor(item.QUANTIDADE);
                const refMecanica = item["REFERÊNCIA/POSIÇÃO MECÂNICA"] || "-";
                const analise = item.ANALISE || "Não Informado";

                return (
                  <tr key={idx}>
                    {/* DATA */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
                        <CalendarIcon width={14} />
                        {new Date(item.DATA).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </div>
                      <div style={{ marginTop: 6 }}>
                         <span style={{ 
                              background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4, 
                              fontSize: "0.7rem", color: "#64748b", border: "1px solid rgba(255,255,255,0.05)"
                          }}>
                            {item.CATEGORIA}
                          </span>
                      </div>
                    </td>

                    {/* MODELO / LINHA */}
                    <td>
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
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ 
                                color: "#FCD34D", fontWeight: 600, fontSize: "0.75rem", 
                                background: "rgba(245, 158, 11, 0.1)", padding: "1px 6px", borderRadius: 4 
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
                    <td>
                         <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <WrenchScrewdriverIcon width={14} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ color: "#E2E8F0", fontSize: "0.8rem", lineHeight: 1.3 }}>
                                {analise}
                            </span>
                        </div>
                    </td>

                    {/* REFERÊNCIA */}
                    <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                             <HashtagIcon width={12} color="#64748b" />
                             <span style={{ 
                                fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: "2px 6px", 
                                borderRadius: 4, color: "#94a3b8", fontSize: "0.75rem"
                             }}>
                                {refMecanica}
                             </span>
                        </div>
                    </td>

                    {/* QUANTIDADE */}
                    <td style={{ textAlign: "center" }}>
                      <span style={{ 
                          background: severity.bg, color: severity.text, border: `1px solid ${severity.border}`,
                          padding: "3px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700,
                          minWidth: 32, display: "inline-block"
                      }}>
                        {item.QUANTIDADE}
                      </span>
                    </td>

                    {/* TÉCNICO */}
                    <td style={{ textAlign: "right", color: "#64748b", fontSize: "0.8rem" }}>
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