"use client";

import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import "./SidebarCategorias.css"; 

// ============================================================================
// MICRO-COMPONENTE DA BARRA (Com Proteção)
// ============================================================================
function AnimatedProgressBar({ targetPct, statusClass }: { targetPct: number; statusClass: string; }) {
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
        className={`prod-progress-bar ${statusClass}`}
        style={{ width: `${width}%` }}
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

  // 🔥 Nova função espelho da página de Defeitos
  function getStatusClass(pct: number) {
    if (pct >= 99.9) return "status-green";
    if (pct >= 60) return "status-yellow";
    return "status-red";
  }

  // Calcula a percentagem e os totais para o cartão Global (Visão Geral)
  const calcGlobalStats = () => {
    if (!categories || categories.length === 0) return { pct: 0, volume: 0, rows: 0 };
    
    let totalVolume = 0;
    let totalRows = 0;
    let totalIdentified = 0; 
    
    categories.forEach(c => {
      totalVolume += (c.volume || 0);
      totalRows += (c.rows || 0);
      totalIdentified += (c.volume || 0) * (parsePct(c.identifiedPct) / 100); 
    });

    const avgPct = totalVolume > 0 ? (totalIdentified / totalVolume) * 100 : 0;

    return { pct: avgPct, volume: totalVolume, rows: totalRows };
  };

  const globalStats = calcGlobalStats();

  const renderCard = (cat: any, isMain: boolean = false) => {
    const key = isMain ? "null" : cat.categoria;
    const label = isMain ? "VISÃO GERAL" : cat.categoria;
    const isActive = isMain
      ? selectedCategory === null
      : selectedCategory === cat.categoria;

    const pct = isMain ? globalStats.pct : parsePct(cat.identifiedPct);
    const volume = isMain ? globalStats.volume : (cat.volume ?? 0);
    const rows = isMain ? globalStats.rows : (cat.rows ?? 0);
    
    // Pegar a classe CSS de cor baseada no percentual
    const statusClass = getStatusClass(pct);

    return (
      <div
        key={key}
        className={`prod-base-card ${isActive ? "active" : ""}`}
        onClick={() => setSelectedCategory(isMain ? null : cat.categoria)}
      >
        <div className="prod-base-header">
          <span className="prod-base-name">
            {isMain && <BarChart3 size={16} color="#ffffff" style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'text-bottom' }} />}
            {label}
          </span>

          {/* Adicionada a classe de status na percentagem */}
          <span className={`prod-base-percent ${statusClass}`}>
            {pct.toFixed(1)}%
          </span>
        </div>

        <div className="prod-base-subinfo">
          <strong style={{ color: '#ffffff' }}>{volume.toLocaleString()}</strong> un. •{" "}
          {rows.toLocaleString()} linhas
        </div>

        {/* Passando a classe de status em vez de cores estáticas inline */}
        <AnimatedProgressBar targetPct={pct} statusClass={statusClass} />

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