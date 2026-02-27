// app/development/diagnostico/components/KpiPrincipalCausa.tsx
"use client";

import { AlertTriangle, Repeat, Layers } from "lucide-react";
import "./KpiPrincipalCausa-glass.css"; // ✅ CSS IMPORTADO

export default function KpiPrincipalCausa({
  data,
}: {
  data?: {
    nome: string;
    ocorrencias: number;
    // ✅ Novo campo opcional injetado pelo backend
    periodosConsecutivos?: number;
  };
}) {
  // ✅ SAFETY CHECK: Estado vazio usa a nova classe
  if (!data) {
    return (
      <div className="kpi-diag-card empty-state fade-in-kpi">
        Carregando...
      </div>
    );
  }

  // ✅ LÓGICA DE REINCIDÊNCIA
  const totalPeriodos = data.periodosConsecutivos || 1;
  const isReincidente = totalPeriodos >= 2; 
  const isCritico = totalPeriodos >= 3;

  const tagClass = isCritico ? "tag-critico" : "tag-alerta";

  return (
    <div className="kpi-diag-card fade-in-kpi">
      
      {/* HEADER */}
      <div className="kpi-diag-header">
        <div className="kpi-diag-icon text-brand-diag">
          <Layers size={22} strokeWidth={2.5} />
        </div>
        <span className="kpi-diag-label">
          Principal Agrupamento
        </span>
      </div>

      {/* VALOR DE DESTAQUE: O Nome da Causa */}
      <div className="kpi-diag-value" title={data.nome || "-"}>
        {data.nome || "-"}
      </div>

      {/* SUBTÍTULO: Tag de Reincidência + Ocorrências */}
      <div className="kpi-diag-sub-wrapper">
        
        {isReincidente && (
          <div className={`kpi-causa-badge ${tagClass}`}>
            {isCritico ? (
                <AlertTriangle size={12} strokeWidth={2.5} />
            ) : (
                <Repeat size={12} strokeWidth={2.5} />
            )}
            <span className="kpi-causa-badge-text">
              {totalPeriodos}x Seguidas
            </span>
          </div>
        )}

        <span className="kpi-diag-sub">
          {data.ocorrencias ? data.ocorrencias.toLocaleString("pt-BR") : 0} ocorrências
        </span>
        
      </div>
      
    </div>
  );
}