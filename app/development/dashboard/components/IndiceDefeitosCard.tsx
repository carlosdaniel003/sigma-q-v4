"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import "./IndiceDefeitosCard-glass.css"; // ✅ NOVO CSS IMPORTADO

interface IndiceDefeitosCardProps {
  meta: number;
  real: number | null;
  projection?: number | null;
}

export default function IndiceDefeitosCard({
  meta,
  real,
  projection,
}: IndiceDefeitosCardProps) {
  
  // Verificação básica: o valor real ultrapassou a meta?
  const isAboveTarget = real !== null ? real > meta : false;

  /* ======================================================
     1. CÁLCULO DO DELTA (COMPARAÇÃO REAL VS META)
  ====================================================== */
  let deltaPercent = 0;
  if (real !== null && meta > 0) {
    deltaPercent = ((real - meta) / meta) * 100;
  }

  /* ======================================================
     2. CLASSES DINÂMICAS DE STATUS
  ====================================================== */
  // No contexto de PPM, acima da meta é mau (danger), abaixo é bom (success)
  const isBad = deltaPercent > 0;
  const isNeutral = deltaPercent === 0;

  const statusClass = isNeutral ? "neutral" : isBad ? "danger" : "success";
  
  const DeltaIcon = isNeutral ? Minus : isBad ? TrendingUp : TrendingDown;

  const deltaText = isNeutral 
    ? "na meta" 
    : isBad 
      ? "acima da meta" 
      : "abaixo da meta";

  /* ======================================================
     3. PROJEÇÃO
  ====================================================== */
  const projIsBad = projection !== null && projection !== undefined ? projection > meta : false;
  const projClass = projIsBad ? "proj-danger" : "proj-neutral";
  const iconProjColor = projIsBad ? "#fb923c" : "#94a3b8";

  const formatPpm = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={`dash-kpi-card ${real !== null ? `status-${statusClass}` : ""}`}>
      
      {/* Título e Meta */}
      <div className="kpi-header-wrapper">
        <div className="kpi-title">
          Índice de Defeitos (PPM)
        </div>
        <div className="kpi-meta">
          Meta: <strong>{formatPpm(meta)}</strong>
        </div>
      </div>

      {/* Valor Real e Bloco do Delta (Real vs Meta) */}
      <div className="kpi-value-row">
        
        {/* Valor Principal */}
        <div className={`kpi-main-value ${real === null ? "text-muted" : `text-${statusClass}`}`}>
          {real !== null ? formatPpm(real) : "—"}
        </div>

        {/* Indicador de Desvio */}
        {real !== null && (
          <div className="kpi-delta-wrapper">
            
            <div className={`kpi-delta-badge badge-${statusClass}`}>
              <DeltaIcon size={14} strokeWidth={3} />
              <span>
                {deltaPercent > 0 ? "+" : ""}{deltaPercent.toFixed(1)}%
              </span>
            </div>

            <span className={`kpi-delta-text text-${statusClass}`}>
              {deltaText}
            </span>
            
          </div>
        )}
      </div>
      
      {/* Rodapé de Projeção */}
      {projection !== null && projection !== undefined && (
        <div className="kpi-footer-proj">
          <Activity size={16} color={iconProjColor} />
          <span>
            Ritmo atual fecha em <strong className={`kpi-proj-value ${projClass}`}>{formatPpm(projection)}</strong>
          </span>
        </div>
      )}

    </div>
  );
}