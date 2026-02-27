"use client";

import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import "./SidebarCategorias.css"; // Apenas carrega as classes isoladas com 'prod-'

// ============================================================================
// MICRO-COMPONENTE DA BARRA (Com Proteção)
// ============================================================================
function AnimatedProgressBar({ targetPct, color, glow }: { targetPct: number; color: string; glow: string; }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Number.isFinite(targetPct) ? Math.max(0, Math.min(100, targetPct)) : 0);
    }, 50);
    return () => clearTimeout(timer);
  }, [targetPct]);

  return (
    <div className="prod-progress-wrapper">
      <div
        className="prod-progress-bar"
        style={{
          width: `${width}%`,
          backgroundColor: color, // Força a cor absoluta da barra
          boxShadow: glow,        // Força o brilho absoluto da barra
        }}
      />
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function SidebarCategorias({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
}) {

  const parsePct = (val: any): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace("%", "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  function getPalette(pct: number) {
    if (pct >= 99.9) return { color: "#4ade80", glow: "0 0 12px rgba(74, 222, 128, 0.5)" };
    if (pct >= 60) return { color: "#facc15", glow: "0 0 12px rgba(250, 204, 21, 0.5)" };
    return { color: "#f87171", glow: "0 0 12px rgba(239, 68, 68, 0.5)" };
  }

  const renderCard = (cat: any, isMain: boolean = false) => {
    const key = isMain ? "null" : cat.categoria;
    const label = isMain ? "VISÃO GERAL" : cat.categoria;
    const isActive = isMain
      ? selectedCategory === null
      : selectedCategory === cat.categoria;

    const pct = isMain ? 0 : parsePct(cat.identifiedPct);
    const palette = getPalette(pct);

    return (
      <div
        key={key}
        className={`prod-base-card ${isActive ? "active" : ""}`}
        onClick={() => setSelectedCategory(isMain ? null : cat.categoria)}
      >
        <div className="prod-base-header">
          <span className="prod-base-name">
            {label}
          </span>

          {isMain && <BarChart3 size={16} color="#ffffff" />}

          {!isMain && (
            <span
              className="prod-base-percent"
              /* ✅ O STYLE DA COR DA FONTE FOI REMOVIDO! 
                 Agora é puramente branco como ditado pelo CSS isolado */
            >
              {pct.toFixed(1)}%
            </span>
          )}
        </div>

        {isMain ? (
          <div className="prod-base-subinfo">
            Resumo geral da produção
          </div>
        ) : (
          <>
            <div className="prod-base-subinfo">
              <strong style={{ color: '#ffffff' }}>{cat.volume?.toLocaleString() ?? 0}</strong> un. •{" "}
              {cat.rows?.toLocaleString() ?? 0} linhas
            </div>

            <AnimatedProgressBar targetPct={pct} color={palette.color} glow={palette.glow} />
          </>
        )}
      </div>
    );
  };

  return (
    <aside className="prod-sidebar-glass">
      <div className="prod-sidebar-title">
        SIGMA-Q
      </div>

      <div className="prod-sidebar-section-title">
        Global
      </div>

      {renderCard({}, true)}

      {categories.length > 0 && (
        <>
          <div className="prod-sidebar-section-title">
            Categorias
          </div>
          {categories.map((c) => renderCard(c))}
        </>
      )}

      {categories.length === 0 && (
        <div
          style={{
            padding: "1rem",
            color: "#94a3b8",
            fontSize: "0.8rem",
            textAlign: "center"
          }}
        >
          Carregando categorias...
        </div>
      )}
    </aside>
  );
}