// app/development/diagnostico/components/KpiPrincipalDefeito.tsx
"use client";

import { Wrench } from "lucide-react";
import "./KpiPrincipalDefeito-glass.css"; // ✅ NOVO CSS IMPORTADO

export default function KpiPrincipalDefeito({
  data,
}: {
  data?: {
    nome: string;
    ocorrencias: number;
  };
}) {
  // ✅ SAFETY CHECK: Usa a classe empty-state elegante
  if (!data) {
    return (
      <div className="kpi-diag-card empty-state fade-in-kpi">
        Carregando...
      </div>
    );
  }

  return (
    <div className="kpi-diag-card fade-in-kpi">
      
      {/* HEADER */}
      <div className="kpi-diag-header">
        <div className="kpi-diag-icon text-purple-diag">
          <Wrench size={22} strokeWidth={2.5} />
        </div>
        <span className="kpi-diag-label">
          Principal Causa
        </span>
      </div>

      {/* VALOR DE DESTAQUE: O Nome da Causa */}
      <div className="kpi-diag-value" title={data.nome || "-"}>
        {data.nome || "-"}
      </div>

      {/* SUBTÍTULO: Contagem de ocorrências */}
      <div className="kpi-diag-sub">
        {data.ocorrencias ? data.ocorrencias.toLocaleString("pt-BR") : 0} ocorrências
      </div>
      
    </div>
  );
}