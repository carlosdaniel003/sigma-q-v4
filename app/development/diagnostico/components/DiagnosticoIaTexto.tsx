"use client";

import React from "react";
import { DiagnosticoIaTexto as DiagnosticoType, InsightCard } from "../hooks/diagnosticoTypes";
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Info, 
  FileText,
  Bot
} from "lucide-react";

import ResumoExecutivo from "./ResumoExecutivo";
import "./DiagnosticoIaTexto-glass.css"; // ✅ NOVO CSS IMPORTADO

/* ======================================================
   PARSER DE TEXTO PARA CARDS (Highlight)
====================================================== */
function renderHighlightedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong
          key={index}
          style={{ color: "#60a5fa", fontWeight: 700 }}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    }
    return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
  });
}

/* ======================================================
   SUB-COMPONENTE: MINI GRÁFICO (Sparkline)
====================================================== */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const width = 80; const height = 24;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1; 

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(" L ");

  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <svg width={width} height={height} style={{ overflow: "visible", opacity: 0.9 }}>
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
      <circle cx={lastX} cy={lastY} r="7" fill={color} opacity="0.25" />
    </svg>
  );
}

/* ======================================================
   SUB-COMPONENTE: INSIGHT CARD ITEM
====================================================== */
function InsightCardItem({ card }: { card: InsightCard }) {
    const config = {
        CRITICO: { color: "#EF4444", icon: AlertTriangle },
        ALERTA: { color: "#F59E0B", icon: TrendingUp },
        MELHORIA: { color: "#22C55E", icon: CheckCircle2 },
        INFO: { color: "#3B82F6", icon: Info }
    }[card.tipo];

    const IconComponent = config.icon;

    return (
        <div className="ia-insight-card" style={{ borderLeftColor: config.color }}>
            <div className="ia-insight-header">
                <div className="ia-insight-title" style={{ color: config.color }}>
                    <IconComponent size={20} strokeWidth={2.5} />
                    {card.titulo}
                </div>
                {card.chartData && card.chartData.length >= 2 && (
                    <Sparkline data={card.chartData} color={config.color} />
                )}
            </div>
            <p className="ia-insight-text">
                {renderHighlightedText(card.descricao)}
            </p>
        </div>
    );
}

/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */
export default function DiagnosticoIaTexto({ data }: { data?: any }) {
  if (!data) {
    return (
      <div className="ia-empty-state">
        <Bot size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
        <p>Aguardando dados para gerar o diagnóstico...</p>
      </div>
    );
  }

  const safeInsights = data.insights || [];
  
  // Mapa de cores para a Badge do Título
  const headerConfig = {
    melhora: { color: "#4ade80", label: "CENÁRIO POSITIVO", bg: "rgba(74, 222, 128, 0.15)", border: "rgba(74, 222, 128, 0.3)" },
    piora: { color: "#f87171", label: "CENÁRIO NEGATIVO", bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)" },
    estavel: { color: "#60a5fa", label: "ESTÁVEL", bg: "rgba(96, 165, 250, 0.15)", border: "rgba(96, 165, 250, 0.3)" },
    indefinido: { color: "#94a3b8", label: "ANÁLISE DE PERÍODO", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.15)" },
  }[data.tendencia as "melhora"|"piora"|"estavel"|"indefinido" || "indefinido"];

  return (
    <div className="ia-panel-container">
        
        {/* ================= HEADER ================= */}
        <div className="ia-panel-header">
            <div className="ia-panel-title-wrapper">
                <div className="ia-bot-icon">
                    <Bot size={22} color="#fff" />
                </div>
                <h2 className="ia-panel-title">
                    {data.titulo}
                </h2>
            </div>
            
            <span 
              className="ia-status-badge" 
              style={{ background: headerConfig.bg, color: headerConfig.color, border: `1px solid ${headerConfig.border}` }}
            >
                {headerConfig.label}
            </span>
        </div>

        {/* ================= CORPO (GRID) ================= */}
        <div className="ia-panel-body">
            
            {/* LADO ESQUERDO: RESUMO EXECUTIVO (40%) */}
            <div className="ia-resumo-col">
                <div className="ia-section-title">
                    <FileText size={18} color="#94a3b8" />
                    <h3>Resumo Executivo</h3>
                </div>
                
                {data.resumoEstruturado ? (
                  <ResumoExecutivo dados={data.resumoEstruturado} />
                ) : (
                  <div className="ia-resumo-text">
                     {(data.resumoGeral || "Analisando dados...").split("\n\n").map((p:string, idx:number) => (
                        <p key={idx} style={{ marginBottom: 12 }}>{renderHighlightedText(p)}</p>
                     ))}
                  </div>
                )}

                {/* KPI CHIPS */}
                <div className="ia-chips-wrapper">
                    {(data.indicadoresChave || []).map((ind: string, i: number) => (
                        <span key={i} className="ia-chip">{ind}</span>
                    ))}
                </div>
            </div>

            {/* DIVISOR DE VIDRO (Invisível em Mobile) */}
            <div className="ia-panel-divider" />

            {/* LADO DIREITO: INSIGHT CARDS (60%) */}
            <div className="ia-insights-col">
                <div className="ia-section-title">
                    <TrendingUp size={18} color="#94a3b8" />
                    <h3>Alertas & Insights</h3>
                </div>
                
                <div className="ia-insights-grid">
                    {safeInsights.length === 0 ? (
                        <div className="ia-insight-empty">
                            <CheckCircle2 size={32} color="#4ade80" style={{ opacity: 0.6, marginBottom: 12 }} />
                            <span>Nenhum alerta crítico detectado no período analisado.</span>
                        </div>
                    ) : (
                        safeInsights.map((card: InsightCard, idx: number) => (
                            <InsightCardItem key={idx} card={card} />
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}