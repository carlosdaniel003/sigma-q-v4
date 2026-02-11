"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

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
    // Calcula quanto o valor real desvia da meta em %
    deltaPercent = ((real - meta) / meta) * 100;
  }

  /* ======================================================
     2. CONFIGURAÇÃO VISUAL
  ====================================================== */
  // No contexto de PPM, se o delta é positivo (real > meta), o indicador é vermelho
  const isBad = deltaPercent > 0; 
  const deltaColor = deltaPercent === 0 ? "#94a3b8" : isBad ? "#ef4444" : "#22c55e"; 
  const deltaBg = deltaPercent === 0 ? "rgba(148, 163, 184, 0.1)" : isBad ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)";
  
  // Ícone: Seta para cima se estiver acima da meta, para baixo se estiver abaixo
  const DeltaIcon = Math.abs(deltaPercent) < 0.1 ? Minus : isBad ? TrendingUp : TrendingDown;

  // Texto descritivo baseado na comparação com a Meta
  const deltaText = Math.abs(deltaPercent) < 0.1 
    ? "na meta" 
    : deltaPercent > 0 
      ? "acima da meta" 
      : "abaixo da meta";

  /* ======================================================
     3. PROJEÇÃO
  ====================================================== */
  const projIsBad = projection !== null && projection !== undefined ? projection > meta : false;
  const projColor = projIsBad ? "#fb923c" : "#94a3b8";

  const formatPpm = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${
          isAboveTarget
            ? "rgba(239, 68, 68, 0.3)" // Borda vermelha se estiver fora da meta
            : "rgba(34, 197, 94, 0.3)" // Borda verde se estiver dentro da meta
        }`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        minHeight: "160px"
      }}
    >
      {/* Título e Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ opacity: 0.7, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Índice de Defeitos (PPM)
          </div>
          <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
            Meta: <strong style={{ color: "#e2e8f0" }}>{formatPpm(meta)}</strong>
          </div>
        </div>
      </div>

      {/* Valor Real e Bloco do Delta (Real vs Meta) */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        
        {/* Valor Principal */}
        <div
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            lineHeight: 1,
            color: real === null 
              ? "#94a3b8" 
              : isAboveTarget ? "#fca5a5" : "#86efac",
          }}
        >
          {real !== null ? formatPpm(real) : "—"}
        </div>

        {/* Indicador de Desvio em relação à Meta */}
        {real !== null && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            
            {/* Badge de Porcentagem */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              background: deltaBg,
              color: deltaColor,
              fontSize: "0.85rem",
              fontWeight: 700,
            }}>
              <DeltaIcon size={14} strokeWidth={3} />
              <span>
                {deltaPercent > 0 ? "+" : ""}{deltaPercent.toFixed(1)}%
              </span>
            </div>

            {/* Texto: "acima da meta" ou "abaixo da meta" */}
            <span style={{ 
              fontSize: "0.75rem", 
              color: deltaColor, 
              opacity: 0.9,
              paddingLeft: 4,
              whiteSpace: "nowrap"
            }}>
              {deltaText}
            </span>
          </div>
        )}
      </div>
      
      {/* Rodapé de Projeção */}
      {projection !== null && projection !== undefined && (
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          animation: "fadeIn 0.5s ease-in-out"
        }}>
          <Activity size={14} color={projColor} />
          <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
            No ritmo atual, fecha em <strong style={{ color: projColor }}>{formatPpm(projection)}</strong>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}