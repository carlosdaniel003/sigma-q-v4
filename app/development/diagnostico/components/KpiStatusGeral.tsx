"use client";

import { ArrowDown, ArrowUp, Minus, Activity } from "lucide-react";
import "./KpiStatusGeral-glass.css"; // ✅ CSS IMPORTADO

interface KpiStatusProps {
  data?: {
    // ✅ Agora aceita os campos de tendência vindos do diagnosticoIa
    tendencia?: "melhora" | "piora" | "estavel" | "indefinido";
    variacaoPercentual?: number;
    
    // Fallback para manter compatibilidade se necessário
    mensagem?: string;
  };
}

export default function KpiStatusGeral({ data }: KpiStatusProps) {
  // ✅ SAFETY CHECK
  if (!data || !data.tendencia) {
    return (
      <div className="kpi-diag-card empty-state fade-in-kpi">
        Aguardando Tendência...
      </div>
    );
  }

  /* ======================================================
     CONFIGURAÇÃO VISUAL MAPA (BASEADA EM PPM E NOVO CSS)
  ====================================================== */
  const config = {
    melhora: {
      label: "Cenário Positivo",
      msg: "Redução de PPM",
      cssClass: "text-success-diag",
      icon: <ArrowDown size={22} strokeWidth={2.5} />,
    },
    piora: {
      label: "Atenção Crítica",
      msg: "Aumento de PPM",
      cssClass: "text-danger-diag",
      icon: <ArrowUp size={22} strokeWidth={2.5} />,
    },
    estavel: {
      label: "Cenário Estável",
      msg: "Variação Não Significativa",
      cssClass: "text-brand-diag",
      icon: <Minus size={22} strokeWidth={2.5} />,
    },
    indefinido: {
      label: "Indefinido",
      msg: "Sem Histórico Suficiente",
      cssClass: "text-muted-diag",
      icon: <Activity size={22} strokeWidth={2.5} />,
    },
  }[data.tendencia] || {
    label: "Indefinido",
    msg: "-",
    cssClass: "text-muted-diag",
    icon: <Activity size={22} strokeWidth={2.5} />,
  };

  // Formatação da porcentagem
  const variacao = data.variacaoPercentual ?? 0;
  const variacaoAbs = Math.abs(variacao).toFixed(1);
  const sinal = variacao > 0 ? "+" : "";

  return (
    <div className="kpi-diag-card fade-in-kpi">
      
      {/* HEADER */}
      <div className="kpi-diag-header">
        <div className={`kpi-diag-icon ${config.cssClass}`}>
          {config.icon}
        </div>
        <span className="kpi-diag-label">
          Tendência Geral
        </span>
      </div>

      {/* VALOR DE DESTAQUE: Título do Status */}
      <div className={`kpi-diag-value ${config.cssClass}`}>
        {config.label}
      </div>

      {/* SUBTÍTULO: Mensagem Rápida */}
      <div className={`kpi-diag-sub ${config.cssClass}`}>
        {config.msg}
      </div>

      {/* RODAPÉ EXTRA: VARIAÇÃO PERCENTUAL */}
      {data.tendencia !== "indefinido" ? (
        <div className="kpi-diag-percent-wrapper">
          <span className="kpi-diag-percent">
            {sinal}{variacaoAbs}%
          </span>
          <span className="kpi-diag-percent-text">
            em relação ao período anterior
          </span>
        </div>
      ) : (
         <div className="kpi-diag-percent-wrapper">
           <span className="kpi-diag-percent-text" style={{ width: "100%", maxWidth: "none" }}>
             Aguardando mais dados para cálculo de tendência.
           </span>
         </div>
      )}

    </div>
  );
}