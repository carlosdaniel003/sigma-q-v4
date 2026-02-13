"use client";

import React, { useMemo } from "react";
import { AlertCircle, BrainCircuit, X, Tag, PackageX } from "lucide-react";

/* ======================================================
   TIPAGEM OFICIAL
====================================================== */
export type FonteFiltro = string;

interface Props {
  diag: any[];
  diagFilter: FonteFiltro;
  setDiagFilter: (v: FonteFiltro) => void;
}

/* ======================================================
   COMPONENTE
====================================================== */
export default function DiagnosticoInteligente({
  diag,
  diagFilter,
  setDiagFilter,
}: Props) {

  /* ======================================================
      NORMALIZAÇÃO DA LISTA
  ====================================================== */
  const normalized = useMemo(() => {
    if (!Array.isArray(diag)) return [];

    return diag
      .map((item) => {
        const rawSource = item.fonte || item.CATEGORIA || item.categoria || "OUTROS";
        const cleanLabel = String(rawSource).trim().toUpperCase();

        return {
          ...item,
          _fonteNorm: cleanLabel.toLowerCase(),
          _fonteLabel: cleanLabel
        };
      })
      .filter(item => item._fonteLabel !== "N/A" && item._fonteLabel !== "");
  }, [diag]);

  /* ======================================================
      CONTADORES
  ====================================================== */
  const counters = useMemo(() => {
    const base: Record<string, number> = {
      todas: 0
    };

    if (normalized.length === 0) return base;
    base.todas = normalized.length;

    for (const item of normalized) {
      const key = item._fonteNorm;
      if (!base[key]) base[key] = 0;
      base[key]++;
    }

    return base;
  }, [normalized]);

  /* ======================================================
      CATEGORIAS DISPONÍVEIS
  ====================================================== */
  const availableCategories = useMemo(() => {
    return Object.keys(counters)
      .filter(k => k !== 'todas')
      .sort();
  }, [counters]);

  /* ======================================================
      FILTRO VISUAL
  ====================================================== */
  const filtered = useMemo(() => {
    if (normalized.length === 0) return [];

    const currentFilter = String(diagFilter).toLowerCase().trim();
    if (currentFilter === "todas") return normalized;

    return normalized.filter(
      (item) => item._fonteNorm === currentFilter
    );
  }, [normalized, diagFilter]);

  const showFilterBar = availableCategories.length > 1;

  /* ======================================================
      RENDER
  ====================================================== */
  return (
    <div style={{
        marginTop: 32,
        background: "rgba(255, 255, 255, 0.01)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        overflow: "hidden"
    }} className="fade-in">
      
      {/* HEADER */}
      <div style={{
        padding: "20px 24px",
        background: "linear-gradient(to right, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.01))",
        borderBottom: "1px solid rgba(59, 130, 246, 0.12)",
        display: "flex", flexDirection: "column", gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ 
                background: "rgba(59, 130, 246, 0.12)", 
                padding: 10, 
                borderRadius: 12, 
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(59, 130, 246, 0.2)"
            }}>
                <BrainCircuit color="#60a5fa" size={24} />
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#93c5fd", fontWeight: 600, letterSpacing: 0.5 }}>
                  DIAGNÓSTICO INTELIGENTE
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, marginTop: 4, maxWidth: "750px" }}>
                  Análise automatizada das divergências sistêmicas e erros de catálogo detectados pelo motor SIGMA-Q (SQL 2026).
                </p>
            </div>
        </div>

        {/* BARRA DE FILTROS TIPO "PILL" */}
        {showFilterBar && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            
            <button
              onClick={() => setDiagFilter("todas")}
              style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20,
                  fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", transition: "all 0.2s",
                  background: diagFilter === "todas" ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${diagFilter === "todas" ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.05)"}`,
                  color: diagFilter === "todas" ? "#60a5fa" : "#94a3b8"
              }}
            >
              GERAL
              <span style={{ 
                  background: counters.todas > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(74, 222, 128, 0.15)", 
                  color: counters.todas > 0 ? "#f87171" : "#4ade80", 
                  padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 800
              }}>
                {counters.todas}
              </span>
            </button>

            {availableCategories.map((catKey) => {
              const isActive = String(diagFilter).toLowerCase().trim() === catKey;
              const hasErrors = counters[catKey] > 0;
              
              return (
                <button
                  key={catKey}
                  onClick={() => setDiagFilter(catKey)}
                  style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20,
                      fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", transition: "all 0.2s",
                      background: isActive ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.05)"}`,
                      color: isActive ? "#60a5fa" : "#94a3b8"
                  }}
                >
                  {catKey.toUpperCase()}
                  <span style={{ 
                      background: hasErrors ? "rgba(239, 68, 68, 0.15)" : "rgba(74, 222, 128, 0.15)", 
                      color: hasErrors ? "#f87171" : "#4ade80", 
                      padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 800
                  }}>
                    {counters[catKey]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "24px" }}>
          {/* ESTADO VAZIO */}
          {filtered.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "#64748b", background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)" }}>
              <PackageX size={32} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>
                {diagFilter === "todas"
                  ? "Nenhuma divergência de catálogo detectada no sistema."
                  : `Não há inconsistências pendentes catalogadas para ${diagFilter.toUpperCase()}.`}
              </p>
            </div>
          )}

          {/* LISTA DE ITENS */}
          {filtered.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
                {filtered.map((item, idx) => (
                  <div key={idx} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${item.severity === "high" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
                      borderRadius: 12, padding: "16px",
                      display: "flex", flexDirection: "column", gap: 12,
                      borderTop: `3px solid ${item.severity === "high" ? "#ef4444" : "#f59e0b"}`,
                      transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Tag size={12} color="#94a3b8" />
                            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {item._fonteLabel}
                            </span>
                        </div>
                        <strong style={{ fontSize: "0.95rem", color: "#f8fafc", lineHeight: 1.3 }}>
                            {item.modelo || "Modelo não identificado"}
                        </strong>
                      </div>

                      <div style={{ 
                          background: item.severity === "high" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                          color: item.severity === "high" ? "#fca5a5" : "#fcd34d", 
                          padding: "4px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap",
                          border: `1px solid ${item.severity === "high" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
                      }}>
                        {item.count ? `${item.count} OCORRÊNCIAS` : "1 OCORRÊNCIA"}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4, background: "rgba(0,0,0,0.1)", padding: 12, borderRadius: 8 }}>
                      {(item.explicacao || item.issues || []).map((msg: string, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                            <X size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} strokeWidth={2.5} />
                            <span>{msg}</span>
                          </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          )}
      </div>
    </div>
  );
}