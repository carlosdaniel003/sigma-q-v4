"use client";

import React from "react";

export default function PerformancePorBase({ perBase }: { perBase: any }) {
  // Pega as chaves dinâmicas (ex: TV, MWO) e remove 'todas'
  const keys = Object.keys(perBase || {})
    .filter(k => k !== 'todas')
    .sort();

  return (
    <div className="per-base-card fade-in">
      <h4 className="inconsistencias-title">Qualidade por Categoria</h4>

      <div className="per-base-grid">
        {keys.map((key) => {
          const base = perBase?.[key];
          const percent = Number(base?.percentIdentified ?? 0);
          const pctString = percent.toFixed(1) + "%";

          const barColor =
            percent < 90
              ? "var(--danger)"
              : percent < 99
              ? "var(--warn)"
              : "var(--success)";

          return (
            <div className="per-base-item" key={key}>
              <div className="per-base-label">{key.toUpperCase()}</div>
              <div className="per-base-percent" style={{ color: barColor }}>
                {pctString}
              </div>
              <div className="per-base-bar">
                <div
                  className="per-base-fill"
                  style={{
                    width: `${percent}%`,
                    background: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}

        {keys.length === 0 && (
            <div style={{fontSize: '0.8rem', color: '#888', fontStyle: 'italic'}}>
                Aguardando dados...
            </div>
        )}
      </div>
    </div>
  );
}