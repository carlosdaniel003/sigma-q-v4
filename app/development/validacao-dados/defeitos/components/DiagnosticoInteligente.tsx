/* app\development\validacao-dados\defeitos\components\DiagnosticoInteligente.tsx */
"use client";

import React, { useMemo } from "react";
import { BrainCircuit, X, Tag, PackageX } from "lucide-react";
import "./DiagnosticoInteligente-glass.css";

export type FonteFiltro = string;

interface Props {
  diag: any[];
  diagFilter: FonteFiltro;
  setDiagFilter: (v: FonteFiltro) => void;
}

export default function DiagnosticoInteligente({
  diag,
  diagFilter,
  setDiagFilter,
}: Props) {

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

  const counters = useMemo(() => {
    const base: Record<string, number> = { todas: 0 };
    if (normalized.length === 0) return base;

    base.todas = normalized.length;

    for (const item of normalized) {
      const key = item._fonteNorm;
      if (!base[key]) base[key] = 0;
      base[key]++;
    }

    return base;
  }, [normalized]);

  const availableCategories = useMemo(() => {
    return Object.keys(counters)
      .filter(k => k !== 'todas')
      .sort();
  }, [counters]);

  const filtered = useMemo(() => {
    if (normalized.length === 0) return [];

    const currentFilter = String(diagFilter).toLowerCase().trim();
    if (currentFilter === "todas") return normalized;

    return normalized.filter(
      (item) => item._fonteNorm === currentFilter
    );
  }, [normalized, diagFilter]);

  const showFilterBar = availableCategories.length > 1;

  return (
    <div className="diag-glass-card fade-in">

      <div className="diag-header">

        <div className="diag-header-top">
          <div className="diag-icon-wrapper">
            <BrainCircuit color="#60a5fa" size={24} />
          </div>

          {/* 🔥 Adicionámos style={{ flex: 1 }} e display flex para empurrar o bloco e alinhá-lo  */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <h3 className="diag-title">
              DIAGNÓSTICO INTELIGENTE
            </h3>
            <p className="diag-subtitle">
              Análise automatizada das divergências sistêmicas e erros de catálogo detectados pelo motor SIGMA-Q (SQL 2026).
            </p>
          </div>
        </div>

        {showFilterBar && (
          <div className="diag-filter-bar">

            <button
              onClick={() => setDiagFilter("todas")}
              className={`diag-pill ${diagFilter === "todas" ? "active" : ""}`}
            >
              GERAL
              <span className="diag-pill-count">
                {counters.todas}
              </span>
            </button>

            {availableCategories.map((catKey) => {
              const isActive = String(diagFilter).toLowerCase().trim() === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setDiagFilter(catKey)}
                  className={`diag-pill ${isActive ? "active" : ""}`}
                >
                  {catKey.toUpperCase()}
                  <span className="diag-pill-count">
                    {counters[catKey]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      <div className="diag-body">

        {filtered.length === 0 && (
          <div className="diag-empty">
            <PackageX size={32} strokeWidth={1.5} />
            <p>
              {diagFilter === "todas"
                ? "Nenhuma divergência de catálogo detectada no sistema."
                : `Não há inconsistências pendentes catalogadas para ${diagFilter.toUpperCase()}.`}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="diag-grid">
            {filtered.map((item, idx) => (
              <div key={idx} className="diag-item">

                <div className="diag-item-header">

                  <div className="diag-item-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Tag size={12} color="#94a3b8" />
                      <span className="diag-tag">
                        {item._fonteLabel}
                      </span>
                    </div>

                    <strong className="diag-modelo">
                      {item.modelo || "Modelo não identificado"}
                    </strong>
                  </div>

                  <div className="diag-badge">
                    {item.count ? `${item.count} OCORRÊNCIAS` : "1 OCORRÊNCIA"}
                  </div>

                </div>

                <div className="diag-issues">
                  {(item.explicacao || item.issues || []).map((msg: string, i: number) => (
                    <div key={i} className="diag-issue">
                      <X size={14} color="#ef4444" strokeWidth={2.5} />
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