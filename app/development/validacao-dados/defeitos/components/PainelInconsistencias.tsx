/* app\development\validacao-dados\defeitos\components\PainelInconsistencias.tsx */
"use client";

import React, { useMemo } from "react";
import { PieChart } from "lucide-react";
import "./PainelInconsistencias-glass.css";

export default function PainelInconsistencias({ breakdown }: { breakdown: any }) {

  const baseItems = useMemo(
    () => [
      { key: "falhas", label: "Códigos de Falha / FMEA" },
      { key: "modelos", label: "Modelos Desconhecidos" },
      { key: "responsabilidades", label: "Fornecedor Inválido" },
      { key: "naoMostrar", label: "Itens Ocultos (Índice)" },
    ],
    []
  );

  const enriched = useMemo(() => {
    const items = baseItems.map((i) => ({
      ...i,
      value: Number(breakdown?.[i.key] ?? 0),
    }));

    items.sort((a, b) => {
      if (a.key === "naoMostrar") return 1;
      if (b.key === "naoMostrar") return -1;
      return b.value - a.value;
    });

    const total = items.reduce((s, i) => s + i.value, 0);

    return items.map((i, index) => {
      const pctReal = total > 0 ? (i.value / total) * 100 : 0;

      let color = "#4ade80";
      if (i.value > 0) {
        if (index === 0) color = "#ef4444";
        else if (pctReal > 20) color = "#f59e0b";
        else color = "#3b82f6";
      }

      return {
        ...i,
        pct: pctReal,
        color
      };
    });
  }, [baseItems, breakdown]);

  return (
    <div className="painel-glass-card fade-in">

      <div className="painel-header">
        <div className="painel-icon-wrapper">
          <PieChart color="#60a5fa" size={20} />
        </div>
        <div>
          <h4 className="painel-title">
            Distribuição de Inconsistências
          </h4>
          <p className="painel-subtitle">
            Volume de peças pendentes por categoria
          </p>
        </div>
      </div>

      <div className="painel-list">
        {enriched.map((item) => (
          <div key={item.key} className="painel-item">

            <span className="painel-label">
              {item.label}
            </span>

            <span
              className="painel-value"
              style={{ color: item.color }}
            >
              {item.value}
            </span>

            <div className="painel-bar-wrapper">
              <div
                className="painel-bar"
                style={{
                  width: `${item.pct}%`,
                  background: item.color,
                  boxShadow:
                    item.value > 0
                      ? `0 0 12px ${item.color}`
                      : "none",
                }}
              />
            </div>

            <span
              className="painel-percent"
              style={{ color: item.color }}
            >
              {item.pct.toFixed(1)}%
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}