"use client";

import React, { useMemo } from "react";
import { AlertCircle, BrainCircuit, X } from "lucide-react";

/* ======================================================
   TIPAGEM OFICIAL (Agora Dinâmica para SQL)
====================================================== */
export type FonteFiltro = string;

interface Props {
  // ⚠️ LISTA COMPLETA (SEM FILTRO DO PAI)
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
      NORMALIZAÇÃO DA LISTA (UMA ÚNICA VEZ)
      Filtra N/A e normaliza strings para evitar erros de match
  ====================================================== */
  const normalized = useMemo(() => {
    if (!Array.isArray(diag)) return [];

    return diag
      .map((item) => {
        // Prioridade de campos vindos do SQL/Adapter 2026
        const rawSource = item.fonte || item.CATEGORIA || item.categoria || "OUTROS";
        
        // Limpeza rigorosa para evitar que "MWO " não bata com "MWO"
        const cleanLabel = String(rawSource).trim().toUpperCase();

        return {
          ...item,
          _fonteNorm: cleanLabel.toLowerCase(),
          _fonteLabel: cleanLabel
        };
      })
      // Remove categorias inválidas (N/A ou vazias)
      .filter(item => item._fonteLabel !== "N/A" && item._fonteLabel !== "");
  }, [diag]);

  /* ======================================================
      CONTADORES (BASEADOS NA LISTA COMPLETA)
  ====================================================== */
  const counters = useMemo(() => {
    const base: Record<string, number> = {
      todas: 0
    };

    if (normalized.length === 0) return base;
    base.todas = normalized.length;

    for (const item of normalized) {
      const key = item._fonteNorm;
      if (!base[key]) {
        base[key] = 0;
      }
      base[key]++;
    }

    return base;
  }, [normalized]);

  /* ======================================================
      LISTA DE CATEGORIAS DISPONÍVEIS (PARA OS BOTÕES)
  ====================================================== */
  const availableCategories = useMemo(() => {
    return Object.keys(counters)
      .filter(k => k !== 'todas')
      .sort();
  }, [counters]);

  /* ======================================================
      FILTRO VISUAL (APENAS EXIBIÇÃO)
  ====================================================== */
  const filtered = useMemo(() => {
    if (normalized.length === 0) return [];

    const currentFilter = String(diagFilter).toLowerCase().trim();

    if (currentFilter === "todas") return normalized;

    return normalized.filter(
      (item) => item._fonteNorm === currentFilter
    );
  }, [normalized, diagFilter]);

  /* ======================================================
      LÓGICA DE EXIBIÇÃO DA BARRA
      Se só temos 1 categoria (ex: filtrou CM na sidebar), 
      não precisamos mostrar os botões de filtro internos.
  ====================================================== */
  const showFilterBar = availableCategories.length > 1;

  return (
    <div className="diag-intel-card fade-in">
      {/* HEADER */}
      <div className="diag-intel-header">
        <div>
          <h4 className="diag-intel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={20} className="text-brand" />
            Diagnóstico Inteligente
          </h4>
          <div className="diag-intel-sub">
            Análise automática das divergências detectadas pelo motor SIGMA-Q (SQL 2026).
          </div>
        </div>

        {/* BARRA DE FILTROS 
            Só renderiza se houver mais de uma categoria para filtrar.
            Se eu selecionei "CM" na sidebar, aqui só tem CM, então esconde a barra.
        */}
        {showFilterBar && (
          <div className="diag-filter-bar">
            <button
              className={`diag-btn ${
                diagFilter === "todas" ? "diag-btn-main active" : ""
              }`}
              onClick={() => setDiagFilter("todas")}
            >
              <span className="label">GERAL</span>
              <span className={`count ${counters.todas > 0 ? "danger" : "ok"}`}>
                {counters.todas}
              </span>
            </button>

            <div className="diag-filter-bases">
              {availableCategories.map((catKey) => (
                <button
                  key={catKey}
                  className={`diag-btn ${
                    String(diagFilter).toLowerCase().trim() === catKey ? "active" : ""
                  }`}
                  onClick={() => setDiagFilter(catKey)}
                >
                  <span className="label">{catKey.toUpperCase()}</span>
                  <span className={`count ${counters[catKey] > 0 ? "danger" : "ok"}`}>
                    {counters[catKey]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LISTA VAZIA (SVG) */}
      {filtered.length === 0 && (
        <div className="diag-empty">
          <AlertCircle size={32} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p>
            {diagFilter === "todas"
              ? "Nenhuma divergência encontrada no sistema."
              : `Não há inconsistências pendentes para ${diagFilter.toUpperCase()}.`}
          </p>
        </div>
      )}

      {/* LISTA DE ITENS */}
      <div className="diag-intel-list">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className={`diag-intel-item ${
              item.severity === "high" ? "danger" : "warn"
            }`}
          >
            <div className="diag-item-header">
              <div className="diag-item-title">
                <span className="diag-item-tag">
                  {item._fonteLabel}
                </span>
                <strong>{item.modelo || "Modelo não identificado"}</strong>
              </div>

              <div className="diag-item-count">
                {item.count ? `${item.count} OCORRÊNCIAS` : "1 OCORRÊNCIA"}
              </div>
            </div>

            <div className="diag-item-explicacoes">
              {(item.explicacao || item.issues || []).map(
                (msg: string, i: number) => (
                  <div key={i} className="diag-item-exp">
                    <span className="diag-exp-icon">
                        <X size={12} strokeWidth={3} />
                    </span>
                    <span>{msg}</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}