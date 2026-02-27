"use client";

import React from "react";
import { FileText, Wrench, AlertTriangle, Brain } from "lucide-react";
import "./KPIsDefeitos.css";

export default function KPIsDefeitos({
  total,
  totalDefeitos,
  notIdentified,
  aiOverall,
}: {
  total: number;
  totalDefeitos: number;
  notIdentified: number;
  aiOverall: number;
}) {

  // Classes blindadas para o CSS novo (Ícones e Textos)
  function getAITextClass() {
    if (aiOverall >= 95) return "text-success-defeitos";
    if (aiOverall >= 50) return "text-warn-defeitos";
    return "text-danger-defeitos";
  }

  function getNotIdTextClass() {
    return notIdentified === 0 ? "text-success-defeitos" : "text-danger-defeitos";
  }

  // Mantemos as classes de borda do card para não quebrar compatibilidade
  function getCardBorderClass(textClass: string) {
    if (textClass.includes("success")) return "kpi-success";
    if (textClass.includes("warn")) return "kpi-warning";
    return "kpi-danger";
  }

  const aiTextClass = getAITextClass();
  const notIdTextClass = getNotIdTextClass();

  return (
    <section className="kpi-grid">

      {/* REGISTROS PROCESSADOS */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon text-brand-defeitos">
            <FileText size={20} />
          </div>
          <div className="kpi-label">Registros Processados</div>
        </div>

        <div className="kpi-value">{total.toLocaleString()}</div>
        <div className="kpi-sub">Linhas brutas analisadas</div>
      </div>

      {/* VOLUME DE DEFEITOS */}
      <div className="kpi-card">
        <div className="kpi-header">
          {/* Mantido inline apenas para o Roxo que é exclusivo deste KPI */}
          <div 
            className="kpi-icon" 
            style={{ 
              background: "rgba(192,132,252,0.12)", 
              borderColor: "rgba(192,132,252,0.25)", 
              color: "#c084fc" 
            }}
          >
            <Wrench size={20} />
          </div>
          <div className="kpi-label">Volume de Defeitos</div>
        </div>

        <div className="kpi-value">{totalDefeitos.toLocaleString()}</div>
        <div className="kpi-sub">Somatória de peças (Qty)</div>
      </div>

      {/* NÃO IDENTIFICADOS */}
      <div className={`kpi-card ${getCardBorderClass(notIdTextClass)}`}>
        <div className="kpi-header">
          <div className={`kpi-icon ${notIdTextClass}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-label">Não Identificados</div>
        </div>

        <div className={`kpi-value ${notIdTextClass}`}>
          {notIdentified.toLocaleString()}
        </div>
        <div className="kpi-sub">Volume de peças inconsistentes</div>
      </div>

      {/* PRECISÃO DA IA */}
      <div className={`kpi-card ${getCardBorderClass(aiTextClass)}`}>
        <div className="kpi-header">
          <div className={`kpi-icon ${aiTextClass}`}>
            <Brain size={20} />
          </div>
          <div className="kpi-label">Precisão da IA</div>
        </div>

        <div className={`kpi-value ${aiTextClass}`}>
          {aiOverall.toFixed(2)}%
        </div>
        <div className="kpi-sub">Qualidade da identificação</div>
      </div>

    </section>
  );
}