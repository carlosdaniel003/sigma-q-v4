"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react"; // Opcional: ícone para o estado vazio

interface TendenciaPpmProps {
  anterior: number;
  atual: number;
  labelAnterior: string; // Pode ser YYYY-MM, Sww ou DD/MM
  labelAtual: string;    
  tipo?: string;         // Adicionado para o título dinâmico no verso
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
     Lida com Meses, Semanas e Dias dinamicamente
  ====================================================== */
  function formatDynamicLabel(label: string): string {
    // 1. Caso seja Dia (formato DD/MM enviado pela page.tsx)
    if (label.includes("/")) {
      return `Dia ${label}`;
    }

    // 2. Caso seja Semana (formato Sxx enviado pela page.tsx)
    if (label.startsWith("S") && !isNaN(Number(label.slice(1)))) {
      return `Semana ${label.slice(1)}`;
    }

    // 3. Caso seja Mês (Mantendo sua lógica original YYYY-MM)
    const parts = label.split("-");
    if (parts.length === 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);

      if (!isNaN(year) && !isNaN(month)) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleDateString("pt-BR", {
          month: "long",
        });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
      }
    }

    // Retorno de segurança
    return label;
  }

  /* ======================================================
     CÁLCULOS
  ====================================================== */
  // ✅ VERIFICAÇÃO DE DADOS: Se não houver histórico ou dados atuais, trata como "Sem Dados"
  const hasData = anterior > 0 || atual > 0;
  // Se anterior for 0, não dá pra calcular % de crescimento matematicamente
  const hasHistory = anterior > 0; 

  const diff = atual - anterior;
  const percent = hasHistory ? (diff / anterior) * 100 : 0;

  const melhorou = diff < 0;
  const piorou = diff > 0;

  const cor = melhorou
    ? "#6bffb0"
    : piorou
    ? "#ff6b6b"
    : "#cccccc";

  const seta = melhorou ? "↓" : piorou ? "↑" : "→";

  const formatPpm = (v: number) =>
    v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPercent = (v: number) =>
    Math.abs(v).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ======================================================
     STYLES
  ====================================================== */
  const containerStyle: React.CSSProperties = {
    perspective: "1200px",
    height: 200,
  };

  const cardStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
    cursor: hasData ? "pointer" : "default", // Desativa cursor se não tiver dados
  };

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    borderRadius: 16,
    padding: 20,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${hasData ? cor + '66' : 'rgba(255,255,255,0.1)'}`, // Borda neutra se sem dados
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  };

  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: "rotateY(180deg)",
    justifyContent: "space-between",
  };

  /* ======================================================
     RENDER: ESTADO "SEM DADOS" (MENSAGEM AMIGÁVEL)
  ====================================================== */
  if (!hasData || !hasHistory) {
      return (
        <div style={containerStyle}>
            <div style={{ ...faceStyle, alignItems: "center", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ opacity: 0.5, fontSize: 13, marginBottom: 8 }}>
                    Tendência de PPM
                </div>
                
                {/* Ícone ou Indicador Visual */}
                <div style={{ color: "#64748b", marginBottom: 8 }}>
                    <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>—</span> 
                </div>

                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#94a3b8" }}>
                    {!hasData ? "Sem dados registrados" : "Histórico insuficiente"}
                </div>
                
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, maxWidth: "90%" }}>
                    {!hasData 
                        ? "Não há produção ou defeitos para o período selecionado." 
                        : "Não há dados do período anterior para calcular a evolução."}
                </div>
            </div>
        </div>
      );
  }

  /* ======================================================
     RENDER: ESTADO NORMAL
  ====================================================== */
  return (
    <div style={containerStyle}>
      <div
        style={cardStyle}
        onClick={() => setFlipped(!flipped)}
        title="Clique para ver detalhes"
      >
        {/* FRENTE — RESUMO */}
        <div style={faceStyle}>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Tendência de PPM
          </div>

          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              color: cor,
              marginTop: 6,
              lineHeight: 1.1,
            }}
          >
            {seta} {formatPercent(percent)}%
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              opacity: 0.75,
            }}
          >
            {melhorou
              ? "Redução no índice de defeitos"
              : piorou
              ? "Aumento no índice de defeitos"
              : "Sem variação significativa"}
          </div>
        </div>

        {/* VERSO — DETALHE */}
        <div style={backStyle}>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Comparativo {tipo === "dia" ? "diário" : tipo === "semana" ? "semanal" : "mensal"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {/* ANTERIOR */}
            <div>
              <div style={{ opacity: 0.6, fontSize: 11, whiteSpace: "nowrap" }}>
                {formatDynamicLabel(labelAnterior)}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {formatPpm(anterior)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>PPM</div>
            </div>

            {/* ATUAL */}
            <div>
              <div style={{ opacity: 0.6, fontSize: 11, whiteSpace: "nowrap" }}>
                {formatDynamicLabel(labelAtual)}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {formatPpm(atual)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>PPM</div>
            </div>
          </div>

          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: cor,
            }}
          >
            {seta} {formatPpm(Math.abs(diff))}{" "}
            <span style={{ fontSize: 11, opacity: 0.7 }}>PPM</span>
          </div>

          <div style={{ fontSize: 11, opacity: 0.65 }}>
            Diferença absoluta entre os períodos
          </div>
        </div>
      </div>
    </div>
  );
}