"use client";

import React, { useState } from "react";
import "./TendenciaPpm-glass.css"; // ✅ NOVO CSS IMPORTADO

interface TendenciaPpmProps {
  anterior: number;
  atual: number;
  labelAnterior: string;
  labelAtual: string;
  tipo?: string;
}

export default function TendenciaPpm({
  anterior,
  atual,
  labelAnterior,
  labelAtual,
  tipo = "mês",
}: TendenciaPpmProps) {
  const [flipped, setFlipped] = useState(false);

  /* ======================================================
     UTIL — FORMATAÇÃO INTELIGENTE DE RÓTULOS
  ====================================================== */
  function formatDynamicLabel(label: string): string {
    if (label.includes("/")) return `Dia ${label}`;
    if (label.startsWith("S") && !isNaN(Number(label.slice(1)))) {
      return `Semana ${label.slice(1)}`;
    }
    const parts = label.split("-");
    if (parts.length === 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
      }
    }
    return label;
  }

  /* ======================================================
     CÁLCULOS & STATUS
  ====================================================== */
  const hasData = anterior > 0 || atual > 0;
  const hasHistory = anterior > 0; 

  const diff = atual - anterior;
  const percent = hasHistory ? (diff / anterior) * 100 : 0;

  // Lógica de status: Redução de PPM é "better" (Verde), Aumento é "worse" (Vermelho)
  const melhorou = diff < 0;
  const piorou = diff > 0;
  
  const statusClass = melhorou ? "better" : piorou ? "worse" : "neutral";
  const seta = melhorou ? "↓" : piorou ? "↑" : "→";

  const formatPpm = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPercent = (v: number) =>
    Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ======================================================
     RENDER: ESTADO "SEM DADOS"
  ====================================================== */
  if (!hasData || !hasHistory) {
      return (
        <div className="tendencia-container">
            <div className="tendencia-card-inner is-disabled">
                <div className="tendencia-face front status-empty">
                    <div className="tend-empty-content">
                        <div className="tend-empty-dash">—</div>
                        <div className="tend-empty-title">
                            {!hasData ? "Sem dados registrados" : "Histórico insuficiente"}
                        </div>
                        <div className="tend-empty-sub">
                            {!hasData 
                                ? "Não há produção ou defeitos para o período." 
                                : "Não há dados do período anterior para evolução."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  /* ======================================================
     RENDER: ESTADO NORMAL (FLIP CARD)
  ====================================================== */
  return (
    <div className="tendencia-container">
      <div
        className={`tendencia-card-inner ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
        title="Clique para ver o comparativo detalhado"
      >
        {/* FRENTE — RESUMO */}
        <div className={`tendencia-face front status-${statusClass}`}>
          <div className="tend-title">
            Tendência de PPM
          </div>

          <div className={`tend-value text-${statusClass}`}>
            {seta} {formatPercent(percent)}%
          </div>

          <div className="tend-sub">
            {melhorou
              ? "Redução no índice de defeitos"
              : piorou
              ? "Aumento no índice de defeitos"
              : "Sem variação significativa"}
          </div>
        </div>

        {/* VERSO — DETALHE */}
        <div className={`tendencia-face back status-${statusClass}`}>
          <div className="tend-title">
            Comparativo {tipo === "dia" ? "diário" : tipo === "semana" ? "semanal" : "mensal"}
          </div>

          <div className="tend-back-grid">
            
            {/* ANTERIOR */}
            <div>
              <div className="tend-back-label">
                {formatDynamicLabel(labelAnterior)}
              </div>
              <div className="tend-back-val">
                {formatPpm(anterior)}
              </div>
              <div className="tend-back-unit">PPM</div>
            </div>

            {/* ATUAL */}
            <div>
              <div className="tend-back-label">
                {formatDynamicLabel(labelAtual)}
              </div>
              <div className="tend-back-val">
                {formatPpm(atual)}
              </div>
              <div className="tend-back-unit">PPM</div>
            </div>

          </div>

          <div className={`tend-diff-val text-${statusClass}`}>
            {seta} {formatPpm(Math.abs(diff))} <span style={{ fontSize: 10, opacity: 0.7 }}>PPM abs.</span>
          </div>

        </div>
      </div>
    </div>
  );
}