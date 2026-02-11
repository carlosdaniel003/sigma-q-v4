"use client";

import React from "react";
import {
  Brain,
  Layers,
  AlertTriangle,
  CheckCircle,
  Factory,
  PackageSearch,
  PackageX,
} from "lucide-react";

type KPIsGeraisProps = {
  overall: any;
  categories: any[];

  categoriasSaudaveis: number;   // 100%
  categoriasAtencao: number;     // >=60% e <100%
  categoriasCriticas: number;    // <60%

  modelosSemDefeitos: number;
  
  // ✅ ATUALIZAÇÃO: Renomeado para refletir que são apenas os CRÍTICOS (Grupo A)
  defeitosSemProducaoCriticos: number; 
};

export default function KPIsGerais({
  overall,
  categories = [],
  categoriasSaudaveis = 0,
  categoriasAtencao = 0,
  categoriasCriticas = 0,
  modelosSemDefeitos = 0,
  defeitosSemProducaoCriticos = 0,
}: KPIsGeraisProps) {
  
  // Extração segura de valores
  const matchRateIA = overall?.matchRateByRows ?? 0;
  const matchRateVol = overall?.matchRateByVolume ?? 0;
  const totalVol = overall?.totalVolume ?? 0;

  return (
    <div
      className="kpi-wrapper"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* ======================================================
          LINHA 1 — IA (QUALIDADE)
      ======================================================= */}
      <div
        className="kpi-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <KPI
          icon={<Brain size={20} />}
          title="Precisão da IA (Match Geral)"
          value={`${matchRateIA.toFixed(2)}%`}
          subtitle="qualidade da identificação"
          color={matchRateIA >= 90 ? "var(--success)" : "var(--danger)"}
        />

        <KPI
          icon={<Layers size={20} />}
          title="Confiabilidade por Volume"
          value={`${matchRateVol.toFixed(2)}%`}
          subtitle="ponderado pelo peso da produção"
          color={matchRateVol >= 90 ? "var(--success)" : "var(--danger)"}
        />
      </div>

      {/* ======================================================
          LINHA 2 — PRODUÇÃO & ERROS ESTRUTURAIS
      ======================================================= */}
      <div
        className="kpi-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <KPI
          icon={<Factory size={20} />}
          title="Volume Produzido"
          value={totalVol.toLocaleString()}
          subtitle="unidades analisadas"
        />

        <KPI
          icon={<CheckCircle size={20} />}
          title="Modelos Sem Defeitos"
          value={modelosSemDefeitos}
          subtitle="produção sem falhas"
          color="var(--success)"
        />

        {/* ✅ ATUALIZADO: Mostra Erros Críticos (Grupo A) */}
        <KPI
          icon={<PackageX size={20} />}
          title="Erros de Validação (Críticos)"
          value={defeitosSemProducaoCriticos}
          subtitle="defeitos sem produção"
          color={defeitosSemProducaoCriticos > 0 ? "var(--danger)" : "var(--success)"}
        />
      </div>

      {/* ======================================================
          LINHA 3 — CATEGORIAS
      ======================================================= */}
      <div
        className="kpi-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <KPI
          icon={<PackageSearch size={20} />}
          title="Categorias Identificadas"
          value={categories.length}
          subtitle="total de categorias"
        />

        <KPI
          icon={<CheckCircle size={20} />}
          title="Categorias Saudáveis"
          value={`${categoriasSaudaveis}/${categories.length}`}
          subtitle="100% de match"
          color="var(--success)"
        />

        <KPI
          icon={<AlertTriangle size={20} />}
          title="Categorias em Atenção"
          value={categoriasAtencao}
          subtitle="≥ 60% e < 100%"
          color={categoriasAtencao > 0 ? "var(--warn)" : "var(--success)"}
        />

        <KPI
          icon={<AlertTriangle size={20} />}
          title="Categorias Críticas"
          value={categoriasCriticas}
          subtitle="< 60% de match"
          color={categoriasCriticas === 0 ? "var(--success)" : "var(--danger)"}
        />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE DO CARD
============================================================ */
function KPI({ icon, title, value, subtitle, color }: any) {
  return (
    <div
      className="stat-card glass-card"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--muted)",
        }}
      >
        {icon}
        <span className="stat-label">{title}</span>
      </div>

      <div
        className="stat-value"
        style={{ color: color ?? "var(--text-strong)" }}
      >
        {value}
      </div>

      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}