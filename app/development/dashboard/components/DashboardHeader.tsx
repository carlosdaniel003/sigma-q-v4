"use client";

import React, { useMemo } from "react";
import { RefreshCw, Clock, Database, ArrowUpCircle, Activity } from "lucide-react";
import "./DashboardHeader-glass.css"; // ✅ NOVO CSS IMPORTADO

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  newDefectsCount: number;
}

export default function DashboardHeader({ 
  lastUpdated, 
  loading, 
  onRefresh, 
  newDefectsCount 
}: DashboardHeaderProps) {

  // Formatação da data (Memoizado para performance)
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className="dash-header-container">
      
      {/* BLOCO ESQUERDO: Títulos e Atualização */}
      <div className="dash-header-left">
        
        <div className="dash-header-pill">
          <div className="dash-header-icon-wrapper">
             <Activity size={24} color="#60a5fa" strokeWidth={2.5} />
          </div>
          <h1 className="dash-header-title">
            SIGMA-Q | Dashboard Técnico
          </h1>
        </div>
        
        <p className="dash-header-subtitle">
          Visão geral dinâmica de indicadores de qualidade.
        </p>
        
        {/* BADGE DE ÚLTIMA ATUALIZAÇÃO */}
        {lastUpdated && (
          <div className="dash-update-badge">
            <Clock size={14} />
            <span>Atualizado {formattedLastUpdated}</span>
            
            {/* Botão de Atualizar Manual */}
            <button 
              className="dash-refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Atualizar agora"
            >
              <RefreshCw 
                size={14} 
                strokeWidth={2.5}
                className={loading ? "animate-spin-fast" : ""} 
              />
            </button>
          </div>
        )}

      </div>

      {/* BLOCO DIREITO: ALERTA DE NOVOS DADOS */}
      {newDefectsCount > 0 && (
        <div 
          className="dash-new-data-alert"
          onClick={onRefresh}
        >
          <Database size={22} color="#fff" />
          
          <div className="dash-alert-text">
            <span className="dash-alert-title">
              Novos dados disponíveis
            </span>
            <span className="dash-alert-sub">
              +{newDefectsCount} defeitos encontrados
            </span>
          </div>
          
          <ArrowUpCircle size={22} color="#fff" />
        </div>
      )}

    </div>
  );
}