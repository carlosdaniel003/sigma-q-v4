"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import "./KpiDefeitoCritico-glass.css"; // ✅ CSS IMPORTADO

export default function KpiDefeitoCritico({
  data,
}: {
  data?: {
    codigo: string;
    descricao: string;
    npr: number;
  };
}) {
  // ✅ SAFETY CHECK: Estado vazio
  if (!data) {
    return (
      <div className="kpi-diag-card empty-state fade-in-kpi">
        Sem dados críticos
      </div>
    );
  }

  /* ======================================================
     COR DINÂMICA PELO NPR
  ====================================================== */
  const nprValue = data.npr || 0;
  
  const nivel =
    nprValue >= 40 ? "danger" : nprValue >= 25 ? "warn" : "success";

  const statusClass = `text-${nivel}-diag`;

  return (
    <div className="kpi-diag-card fade-in-kpi">
      
      {/* HEADER */}
      <div className="kpi-diag-header">
        <div className={`kpi-diag-icon ${statusClass}`}>
          {nivel === "success" ? (
            <CheckCircle size={22} strokeWidth={2.5} />
          ) : (
            <AlertTriangle size={22} strokeWidth={2.5} />
          )}
        </div>
        <span className="kpi-diag-label">
          Maior Risco de Qualidade
        </span>
      </div>

      {/* VALOR DE DESTAQUE: A Descrição do Defeito */}
      <div className="kpi-diag-value" title={data.descricao || "-"}>
        {data.descricao || "-"}
      </div>

      {/* SUBTÍTULO: O NPR com cor correspondente à gravidade */}
      <div className={`kpi-diag-sub ${statusClass}`}>
        NPR: {nprValue}
      </div>

    </div>
  );
}