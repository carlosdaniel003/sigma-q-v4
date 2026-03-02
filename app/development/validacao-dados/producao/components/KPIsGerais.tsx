"use client";
/* app\development\validacao-dados\producao\components\KPIsGerais.tsx*/
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

import "./KPIsGerais-glass.css"; // ✅ NOVO CSS GLASS

type KPIsGeraisProps = {
  overall: any;
  categories: any[];

  categoriasSaudaveis: number;
  categoriasAtencao: number;
  categoriasCriticas: number;

  modelosSemDefeitos: number;
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
  
  const matchRateIA = overall?.matchRateByRows ?? 0;
  const matchRateVol = overall?.matchRateByVolume ?? 0;
  const totalVol = overall?.totalVolume ?? 0;

  return (
  <div className="kpi-wrapper">

    {/* LINHA 1 — 2 colunas */}
    <div className="kpi-row cols-2">
      <KPI
        icon={<Brain size={24} />}
        title="Precisão da IA (Geral)"
        value={`${matchRateIA.toFixed(2)}%`}
        subtitle="qualidade da identificação"
        colorClass={matchRateIA >= 90 ? "text-success-kpi" : "text-danger-kpi"}
      />
      <KPI
        icon={<Layers size={24} />}
        title="Confiabilidade por Vol"
        value={`${matchRateVol.toFixed(2)}%`}
        subtitle="ponderado por produção"
        colorClass={matchRateVol >= 90 ? "text-success-kpi" : "text-danger-kpi"}
      />
    </div>

    {/* LINHA 2 — 3 colunas */}
    <div className="kpi-row cols-3">
      <KPI
        icon={<Factory size={24} />}
        title="Volume Produzido"
        value={totalVol.toLocaleString()}
        subtitle="unidades analisadas"
        colorClass="text-brand-kpi"
      />
      <KPI
        icon={<CheckCircle size={24} />}
        title="Modelos Sem Defeitos"
        value={modelosSemDefeitos}
        subtitle="produção sem falhas"
        colorClass="text-success-kpi"
      />
      <KPI
        icon={<PackageX size={24} />}
        title="Erros (Críticos)"
        value={defeitosSemProducaoCriticos}
        subtitle="defeitos sem produção"
        colorClass={defeitosSemProducaoCriticos > 0 ? "text-danger-kpi" : "text-success-kpi"}
      />
    </div>

    {/* LINHA 3 — 4 colunas */}
    <div className="kpi-row cols-4">
      <KPI
        icon={<PackageSearch size={24} />}
        title="Cat. Identificadas"
        value={categories.length}
        subtitle="total de categorias"
        colorClass="text-brand-kpi"
      />
      <KPI
        icon={<CheckCircle size={24} />}
        title="Categorias Saudáveis"
        value={`${categoriasSaudaveis}/${categories.length}`}
        subtitle="100% de match"
        colorClass="text-success-kpi"
      />
      <KPI
        icon={<AlertTriangle size={24} />}
        title="Categorias em Atenção"
        value={categoriasAtencao}
        subtitle="≥ 60% e < 100%"
        colorClass={categoriasAtencao > 0 ? "text-warn-kpi" : "text-success-kpi"}
      />
      <KPI
        icon={<AlertTriangle size={24} />}
        title="Categorias Críticas"
        value={categoriasCriticas}
        subtitle="< 60% de match"
        colorClass={categoriasCriticas === 0 ? "text-success-kpi" : "text-danger-kpi"}
      />
    </div>

  </div>
);
}

/* ============================================================
   COMPONENTE DO CARD (REMODELADO PARA O NOVO CSS DEFEITOS-LIKE)
============================================================ */
function KPI({ icon, title, value, subtitle, colorClass }: any) {
  // Se não foi passada uma cor, assume o azul padrão da marca
  const finalColorClass = colorClass || "text-brand-kpi";

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className={`kpi-icon ${finalColorClass}`}>
          {icon}
        </div>
        <span className="kpi-label">{title}</span>
      </div>

      <div className={`kpi-value ${finalColorClass}`}>
        {value}
      </div>

      <div className="kpi-sub">{subtitle}</div>
    </div>
  );
}