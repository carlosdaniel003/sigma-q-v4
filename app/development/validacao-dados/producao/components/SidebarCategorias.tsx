"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function SidebarCategorias({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
}) {

  // ✅ CORREÇÃO: Parser robusto para garantir que não quebre com strings "98%"
  const parsePct = (val: any): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace("%", "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  function getColor(pct: number) {
    // Ajustado para 99.9 para pegar casos de arredondamento
    if (pct >= 99.9) return "var(--success)";
    if (pct >= 60) return "var(--warn)";
    return "var(--danger)";
  }

  // Função auxiliar para renderizar cards (padrão igual SidebarDefeitos)
  const renderCard = (cat: any, isMain: boolean = false) => {
    const key = isMain ? "null" : cat.categoria;
    const label = isMain ? "VISÃO GERAL" : cat.categoria;
    const isActive = isMain ? selectedCategory === null : selectedCategory === cat.categoria;
    
    // Se for main, não tem pct específico aqui (ou poderia ser calculado globalmente)
    const pct = isMain ? 0 : parsePct(cat.identifiedPct);
    const color = getColor(pct);

    return (
      <div
        key={key}
        className={`base-card ${isActive ? "active" : ""}`}
        onClick={() => setSelectedCategory(isMain ? null : cat.categoria)}
        style={isMain ? { marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" } : {}}
      >
        <div className="base-header">
          <span className="base-name" style={isMain ? { fontSize: "0.9rem", fontWeight: 700 } : {}}>
            {label}
          </span>
          
          {isMain && <BarChart3 size={16} />}

          {!isMain && (
            <span
              className="base-percent"
              style={{ color }}
            >
              {pct.toFixed(1)}%
            </span>
          )}
        </div>

        {isMain ? (
             <div className="base-subinfo" style={{marginTop: "0.5rem"}}>
                Resumo geral da produção
             </div>
        ) : (
            <>
                <div className="base-subinfo">
                    <strong>{cat.volume?.toLocaleString() ?? 0}</strong> un. •{" "}
                    {cat.rows?.toLocaleString() ?? 0} linhas
                </div>

                <div className="progress-wrapper">
                    <div
                    className="progress-bar"
                    style={{
                        width: `${pct}%`,
                        background: color,
                    }}
                    />
                </div>
            </>
        )}
      </div>
    );
  };

  return (
    <aside className="defeitos-sidebar">
      
      {/* TÍTULO */}
      <div className="sidebar-title" style={{ color: "var(--brand)" }}>
        SIGMA-Q
      </div>

      {/* ============================================================
          CATEGORIAS
      ============================================================ */}
      <div className="sidebar-group">
        <div className="sidebar-title">Global</div>
        {/* VISÃO GERAL */}
        {renderCard({}, true)}

        {categories.length > 0 && (
            <>
                <div className="sidebar-title" style={{marginTop: "1rem"}}>Categorias</div>
                {/* LISTA DE CATEGORIAS */}
                {categories.map((c) => renderCard(c))}
            </>
        )}

        {categories.length === 0 && (
             <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Carregando categorias...
             </div>
        )}
      </div>
    </aside>
  );
}