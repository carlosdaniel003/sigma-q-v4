"use client";

import React from "react";

export default function SidebarDefeitos({
  fonte,
  setFonte,
  perBase,
}: {
  fonte: string;
  // Aceita função void ou o Dispatch do React, flexibilizando o uso
  setFonte: ((f: string) => void) | React.Dispatch<React.SetStateAction<any>>;
  perBase: any;
}) {
  function getColor(pct: number) {
    if (pct === 100) return "var(--success)";
    if (pct >= 50) return "var(--warn)";
    return "var(--danger)";
  }

  // 1. Separa "todas" do resto das categorias
  const { todas, ...categoriasRestantes } = perBase || {};
  
  // 2. Ordena as categorias alfabeticamente
  const listaCategorias = Object.keys(categoriasRestantes || {}).sort();

  const renderCard = (key: string, label: string, isMain: boolean = false) => {
    const b = perBase?.[key];
    if (!b) return null;

    const pct = Number(b?.percentIdentified ?? 0);
    const linhas = b?.total ?? 0;
    const defeitos = b?.totalDefeitos ?? 0;
    const isActive = fonte === key;

    return (
      <div
        key={key}
        className={`base-card ${isActive ? "active" : ""}`}
        onClick={() => setFonte(key)}
        style={isMain ? { marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" } : {}}
      >
        <div className="base-header">
          <span className="base-name" style={isMain ? { fontSize: "0.9rem", fontWeight: 700 } : {}}>
            {label}
          </span>

          {!isMain && (
            <span
              className="base-percent"
              style={{ color: getColor(pct) }}
            >
              {pct.toFixed(1)}%
            </span>
          )}
        </div>

        {!isMain && (
          <>
            <div className="base-subinfo">
              {linhas.toLocaleString()} Linhas •{" "}
              <strong style={{ color: "var(--text-strong)" }}>
                {defeitos.toLocaleString()}
              </strong>{" "}
              defeitos
            </div>

            <div className="progress-wrapper">
              <div
                className="progress-bar"
                style={{
                  width: `${pct}%`,
                  background: getColor(pct),
                }}
              />
            </div>
          </>
        )}
        
        {isMain && (
             <div className="base-subinfo" style={{marginTop: "0.5rem"}}>
                Total: <strong>{defeitos.toLocaleString()}</strong> defeitos
             </div>
        )}
      </div>
    );
  };

  return (
    <aside className="defeitos-sidebar">
      <div className="sidebar-title" style={{ color: "var(--brand)" }}>
        SIGMA-Q
      </div>

      <div className="sidebar-group">
        <div className="sidebar-title">Global</div>
        {renderCard("todas", "VISÃO GERAL", true)}

        {listaCategorias.length > 0 && (
            <>
                <div className="sidebar-title">Categorias</div>
                {listaCategorias.map((cat) => renderCard(cat, cat))}
            </>
        )}

        {listaCategorias.length === 0 && (
            <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Carregando categorias...
            </div>
        )}
      </div>

      <div className="sidebar-group muted" style={{ marginTop: "auto", fontSize: "0.75rem", lineHeight: "1.4" }}>
      </div>
    </aside>
  );
}