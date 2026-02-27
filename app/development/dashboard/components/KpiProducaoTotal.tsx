// app/development/dashboard/components/KpiProducaoTotal.tsx
"use client";

import React from "react";
import { Package } from "lucide-react";
import "./KpiProducaoTotal-glass.css"; // ✅ NOVO CSS IMPORTADO

interface KpiProducaoTotalProps {
  value: string;
}

export default function KpiProducaoTotal({ value }: KpiProducaoTotalProps) {
  return (
    <div className="kpi-prod-card">
      
      {/* Cabeçalho: Ícone + Título */}
      <div className="kpi-prod-header">
        <div className="kpi-prod-icon">
          <Package size={22} strokeWidth={2.5} />
        </div>
        <span className="kpi-prod-title">
          Produção Total
        </span>
      </div>

      {/* Valor Numérico Gigante */}
      <div className="kpi-prod-value">
        {value}
      </div>

    </div>
  );
}