"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import "./KpiQuantidadeDefeitos-glass.css"; // ✅ NOVO CSS IMPORTADO

interface KpiQuantidadeDefeitosProps {
  value: string | number;
}

export default function KpiQuantidadeDefeitos({ value }: KpiQuantidadeDefeitosProps) {
  return (
    <div className="kpi-qtd-card">
      
      {/* Cabeçalho: Ícone + Título */}
      <div className="kpi-qtd-header">
        <div className="kpi-qtd-icon">
          <AlertTriangle size={22} strokeWidth={2.5} />
        </div>
        <span className="kpi-qtd-title">
          Qtd. Defeitos
        </span>
      </div>

      {/* Valor Numérico Gigante */}
      <div className="kpi-qtd-value">
        {value}
      </div>
      
    </div>
  );
}