"use client";

import React, { useMemo } from "react";
import { PieChart } from "lucide-react";

export default function PainelInconsistencias({ breakdown }: { breakdown: any }) {

  /* ======================================================
     1️⃣ DADOS BASE (IMUTÁVEIS)
  ====================================================== */
  const baseItems = useMemo(
    () => [
      { key: "falhas", label: "Códigos de Falha / FMEA" },
      { key: "modelos", label: "Modelos Desconhecidos" },
      { key: "responsabilidades", label: "Fornecedor Inválido" },
      { key: "naoMostrar", label: "Itens Ocultos (Índice)" },
    ],
    []
  );

  /* ======================================================
     2️⃣ ENRIQUECIMENTO + CÁLCULOS (MEMORIZADO)
  ====================================================== */
  const enriched = useMemo(() => {
    const items = baseItems.map((i) => ({
      ...i,
      value: Number(breakdown?.[i.key] ?? 0),
    }));

    // Ordena para os maiores ficarem no topo (Exceto "Não Mostrar")
    items.sort((a, b) => {
        if (a.key === 'naoMostrar') return 1;
        if (b.key === 'naoMostrar') return -1;
        return b.value - a.value;
    });

    const total = items.reduce((s, i) => s + i.value, 0);

    return items.map((i, index) => {
      const pctReal = total > 0 ? (i.value / total) * 100 : 0;

      // Paleta de cores premium
      let color = "#4ade80"; // Verde (Zerado)
      let bgBar = "rgba(74, 222, 128, 0.2)";

      if (i.value > 0) {
        if (index === 0) {
            color = "#ef4444"; // Vermelho (Top ofensor)
            bgBar = "rgba(239, 68, 68, 0.2)";
        } else if (pctReal > 20) {
            color = "#f59e0b"; // Laranja/Amarelo (Alerta)
            bgBar = "rgba(245, 158, 11, 0.2)";
        } else {
            color = "#3b82f6"; // Azul (Baixo impacto)
            bgBar = "rgba(59, 130, 246, 0.2)";
        }
      }

      return {
        ...i,
        pct: pctReal,
        color,
        bgBar
      };
    });
  }, [baseItems, breakdown]);

  /* ======================================================
     3️⃣ RENDER (PURO — SEM CÁLCULOS)
  ====================================================== */
  return (
    <div
      className="inconsistencias-card fade-in"
      style={{
        background: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: "24px",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ 
              background: "rgba(59, 130, 246, 0.1)", padding: 8, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59, 130, 246, 0.2)"
          }}>
              <PieChart color="#60a5fa" size={20} />
          </div>
          <div>
              <h4 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 600, letterSpacing: 0.5 }}>
                Distribuição de Inconsistências
              </h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  Volume de peças pendentes por categoria
              </p>
          </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
        {enriched.map((item) => (
          <div
            key={item.key}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 40px 1fr 50px",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255,255,255,0.015)",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.03)",
              cursor: "default",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.015)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* Nome */}
            <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.label}
            </span>

            {/* Quantidade */}
            <span style={{ color: item.color, fontWeight: 800, fontSize: "0.95rem", textAlign: "right" }}>
              {item.value}
            </span>

            {/* Barra Neon */}
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${item.pct}%`,
                  height: "100%",
                  background: item.color,
                  boxShadow: item.value > 0 ? `0 0 8px ${item.bgBar}` : "none",
                  borderRadius: "10px",
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            {/* Percentual */}
            <span style={{ color: item.color, fontWeight: 700, fontSize: "0.75rem", textAlign: "right" }}>
              {item.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}