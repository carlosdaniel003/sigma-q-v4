"use client";

import React from "react";
import { X, User, Clock, FileText, Hash, Info, Activity, AlertTriangle, Box, MapPin, Layers } from "lucide-react";

/* ======================================================
   TIPAGEM DOS DADOS DETALHADOS (MAPEADO DO SEU JSON SQL)
====================================================== */
export interface DefectDetailRow {
  id: string | number;
  data: string;       
  hora: string;       
  tecnico: string;
  modelo?: string;     
  posicao?: string;    
  motivoCod: string;   
  motivoDesc: string;  
  observacao: string;  
  componente: string;  
  sintoma?: string;    
  linha?: string;      
  status?: string;     
  causa?: string;      
  quantidade?: number; 
}

interface DefectDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;      
  loading: boolean;
  rows: DefectDetailRow[];
}

export default function DefectDetailsDrawer({
  isOpen,
  onClose,
  title,
  loading,
  rows
}: DefectDetailsDrawerProps) {
  
  if (!isOpen) return null;

  // ✅ CÁLCULO DA QUANTIDADE TOTAL REAL DE PEÇAS
  const totalPecas = rows.reduce((acc, row) => acc + (row.quantidade || 1), 0);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      justifyContent: "flex-end",
    }}>
      {/* BACKDROP */}
      <div 
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          animation: "fadeIn 0.3s forwards"
        }}
      />

      {/* PAINEL LATERAL (ESTILO EXECUTIVO) */}
      <div style={{
        position: "relative",
        width: "550px",
        maxWidth: "95vw",
        height: "100%",
        background: "#0f172a", 
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "-15px 0 40px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}>
        
        {/* HEADER */}
        <div style={{
          padding: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.02)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Activity size={16} color="#60a5fa" />
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                  Auditoria de Análise Técnica
                </h2>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>
                {title}
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                width: "32px", height: "32px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#94a3b8", transition: "0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: 12 }}>
                <div className="animate-spin" style={{ width: 30, height: 30, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%" }} />
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Consultando banco SQL...</span>
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
              <Info size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Nenhum detalhe encontrado para este filtro.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* CABEÇALHO DE CONTAGEM */}
              <div style={{ display: "flex", gap: 24, paddingLeft: 8, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1 }}>
                <span style={{ color: "#475569" }}>
                  Registros: <strong style={{ color: "#94a3b8" }}>{rows.length}</strong>
                </span>
                <span style={{ color: "#475569" }}>
                  Total de Peças: <strong style={{ color: "#f59e0b", fontSize: "0.85rem" }}>{totalPecas}</strong>
                </span>
              </div>

              {rows.map((row, idx) => (
                <div key={row.id || idx} style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transition: "transform 0.2s",
                }}>
                  {/* METADADOS SUPERIORES */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#f8fafc", background: "rgba(59, 130, 246, 0.1)", padding: "4px 8px", borderRadius: 6 }}>
                            <Clock size={14} color="#60a5fa" />
                            {row.data} <span style={{ opacity: 0.5 }}>•</span> {row.hora}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#f8fafc", background: "rgba(245, 158, 11, 0.1)", padding: "4px 8px", borderRadius: 6 }}>
                            <User size={14} color="#f59e0b" />
                            {row.tecnico}
                        </div>
                        {/* TAG DE QUANTIDADE */}
                        {row.quantidade && row.quantidade > 1 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#f8fafc", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 8px", borderRadius: 6 }}>
                                <Layers size={14} color="#fca5a5" />
                                Qtd: <strong style={{ color: "#fca5a5" }}>{row.quantidade}</strong>
                            </div>
                        )}
                    </div>
                    {/* BADGE DE LINHA */}
                    {row.linha && (
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                            {row.linha}
                        </div>
                    )}
                  </div>

                  {/* ✅ BLOCO MODELO E POSIÇÃO (Agora separados em grid) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                     <div style={{ background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                          <Box size={12} color="#94a3b8" /> Modelo / Produto
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}>{row.modelo}</div>
                     </div>
                     <div style={{ background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                          <MapPin size={12} color="#94a3b8" /> Posição Mecânica
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}>{row.posicao}</div>
                     </div>
                  </div>

                  {/* MOTIVO E CAUSA */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                     <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Responsabilidade (Cód: {row.motivoCod})</div>
                        <div style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 500 }}>{row.motivoDesc}</div>
                     </div>
                     <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Causa (Análise)</div>
                        <div style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 500 }}>{row.causa || "Não informada"}</div>
                     </div>
                  </div>

                  {/* SINTOMA E COMPONENTE */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>
                           <AlertTriangle size={14} color="#ef4444" /> Sintoma / Falha
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
                            {row.sintoma}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>
                           <Hash size={14} color="#3b82f6" /> Componente da Placa
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
                            {row.componente}
                        </div>
                      </div>
                  </div>

                  {/* OBSERVAÇÃO TÉCNICA */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                        <FileText size={18} color="#64748b" style={{ marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Observação da Análise</div>
                            <div style={{ 
                                fontSize: "0.92rem", 
                                color: row.observacao ? "#f1f5f9" : "#475569", 
                                lineHeight: 1.5,
                                fontStyle: row.observacao ? "normal" : "italic" 
                            }}>
                                {row.observacao || "Nenhuma observação detalhada foi inserida pelo técnico para este registro."}
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { 
          from { transform: translateX(100%); opacity: 0.5; } 
          to { transform: translateX(0); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}