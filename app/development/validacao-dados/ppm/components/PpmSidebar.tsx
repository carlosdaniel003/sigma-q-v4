"use client";

import React, { useEffect, useState } from "react";
import "./ppm-sidebar-glass.css";

/* ======================================================
   TIPOS
====================================================== */

interface CategoryInfo {
  production: number;
  defects: number;
  ppm: number | null;
  aiPrecision: number;
  status: "SAUDAVEL" | "CRITICO";
}

interface Props {
  byCategory: Record<string, CategoryInfo>;
  meta: {
    totalVolume: number;
    totalDefeitos: number;
    aiPrecision: number;
  };

  categoriaAtiva: string | null;
  onSelectCategory: (categoria: string | null) => void;
}

/* ======================================================
   STATUS VISUAL
====================================================== */
function getStatusClass(precision: number) {
  if (precision >= 90) return "ok";
  if (precision >= 50) return "warn";
  return "bad";
}

/* ============================================================================
   🚀 MICRO-COMPONENTE: Barra de Progresso Animada à Prova de Cache
============================================================================ */
function AnimatedPpmProgressBar({ targetPct, statusClass }: { targetPct: number, statusClass: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Dá 50ms para o React colocar o elemento na tela no 0%, e depois dispara para o tamanho real.
    const timer = setTimeout(() => {
      setWidth(Number.isFinite(targetPct) ? Math.max(0, Math.min(100, targetPct)) : 0);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [targetPct]);

  return (
    <div className="ppm-sidebar-bar">
      <div
        className={`ppm-sidebar-bar-fill ${statusClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ============================================================================
   COMPONENTE PRINCIPAL
============================================================================ */
export default function PpmSidebar({
  byCategory,
  meta,
  categoriaAtiva,
  onSelectCategory,
}: Props) {
  const geralStatus = getStatusClass(meta.aiPrecision);

  return (
    <aside className="ppm-sidebar">
      <div className="ppm-sidebar-header">SIGMA-Q</div>

      <div className="ppm-sidebar-section-title">Categorias</div>

      {/* =========================
          VISÃO GERAL
      ========================= */}
      <div
        className={`ppm-sidebar-item ${
          categoriaAtiva === null ? "active" : ""
        }`}
        onClick={() => onSelectCategory(null)}
      >
        <div className="ppm-sidebar-item-header">
          <span>VISÃO GERAL</span>
          <span className={`ppm-sidebar-percent ${geralStatus}`}>
            {meta.aiPrecision.toFixed(1)}%
          </span>
        </div>

        <div className="ppm-sidebar-sub">
          Prod: {meta.totalVolume.toLocaleString()} un. • Def:{" "}
          {meta.totalDefeitos.toLocaleString()}
        </div>

        {/* ✅ Barra animada da Visão Geral */}
        <AnimatedPpmProgressBar targetPct={meta.aiPrecision} statusClass={geralStatus} />
      </div>

      {/* =========================
          CATEGORIAS (FONTE: CORE)
      ========================= */}
      {Object.entries(byCategory).map(([categoria, info]) => {
        const status = getStatusClass(info.aiPrecision);
        const active = categoriaAtiva === categoria;

        return (
          <div
            key={categoria}
            className={`ppm-sidebar-item ${active ? "active" : ""}`}
            onClick={() => onSelectCategory(categoria)}
          >
            <div className="ppm-sidebar-item-header">
              <span>{categoria}</span>
              <span className={`ppm-sidebar-percent ${status}`}>
                {info.aiPrecision.toFixed(1)}%
              </span>
            </div>

            <div className="ppm-sidebar-sub">
              Prod: {info.production.toLocaleString()} un. • Def:{" "}
              {info.defects.toLocaleString()}
            </div>

            {/* ✅ Barra animada por categoria */}
            <AnimatedPpmProgressBar targetPct={info.aiPrecision} statusClass={status} />
          </div>
        );
      })}
    </aside>
  );
}