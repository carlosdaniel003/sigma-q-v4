"use client";

import {
  CpuChipIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import "./ppm-kpis-glass.css"; // ✅ NOVO CSS

interface Props {
  meta: {
    totalVolume: number;
    totalDefeitos: number;
    ppmGeral: number | null;
    aiPrecision: number;
    itensSemProducao: number;
    itensSemDefeitos: number;
    ocorrencias: number;
  };
}

function getPrecisionClass(value: number) {
  if (value < 50) return "text-danger-ppm";
  if (value < 90) return "text-warn-ppm";
  return "text-success-ppm";
}

export default function PpmKpis({ meta }: Props) {
  const precisionClass = getPrecisionClass(meta.aiPrecision);

  return (
    <div className="kpis-wrapper">
      
      {/* LINHA 1 */}
      <div className="kpi-row">
        
        {/* PRECISÃO DA IA */}
        <div className="stat-card">
          <div className="stat-header">
            <div className={`stat-icon ${precisionClass}`}>
              <CpuChipIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">PRECISÃO DA IA</span>
          </div>
          <div className={`stat-value ${precisionClass}`}>
            {meta.aiPrecision.toFixed(2)}%
          </div>
          <div className="stat-sub">qualidade da identificação</div>
        </div>

        {/* VOLUME PRODUZIDO */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-brand-ppm">
              <CubeIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">VOLUME PRODUZIDO</span>
          </div>
          <div className="stat-value">
            {meta.totalVolume.toLocaleString()}
          </div>
          <div className="stat-sub">unidades analisadas</div>
        </div>

        {/* DEFEITOS REGISTRADOS */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-danger-ppm">
              <ExclamationTriangleIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">DEFEITOS</span>
          </div>
          <div className="stat-value text-danger-ppm">
            {meta.totalDefeitos.toLocaleString()}
          </div>
          <div className="stat-sub">defeitos registrados</div>
        </div>

      </div>

      {/* LINHA 2 */}
      <div className="kpi-row">
        
        {/* PPM GERAL */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-highlight-ppm">
              <ChartBarIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">PPM GERAL</span>
          </div>
          <div className="stat-value">
            {meta.ppmGeral !== null ? meta.ppmGeral.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : "—"}
          </div>
          <div className="stat-sub">defeitos por milhão</div>
        </div>

        {/* ITENS SEM PRODUÇÃO */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-danger-ppm">
              <ExclamationTriangleIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">ITENS SEM PRODUÇÃO</span>
          </div>
          <div className={`stat-value ${meta.itensSemProducao > 0 ? "text-danger-ppm" : "text-success-ppm"}`}>
            {meta.itensSemProducao}
          </div>
          <div className="stat-sub">apontamentos não encontrados</div>
        </div>

        {/* ITENS SEM DEFEITOS */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-success-ppm">
              <CheckCircleIcon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">ITENS SEM DEFEITOS</span>
          </div>
          <div className="stat-value text-success-ppm">
            {meta.itensSemDefeitos}
          </div>
          <div className="stat-sub">produção sem falhas</div>
        </div>

      </div>

      {/* LINHA 3 */}
      <div className="kpi-row">
        {/* OCORRÊNCIAS */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon text-purple-ppm">
              <Squares2X2Icon width={24} strokeWidth={2} />
            </div>
            <span className="stat-label">OCORRÊNCIAS</span>
          </div>
          <div className="stat-value">
            {meta.ocorrencias}
          </div>
          <div className="stat-sub">
            não influenciam PPM nem indicadores
          </div>
        </div>
      </div>
      
    </div>
  );
}