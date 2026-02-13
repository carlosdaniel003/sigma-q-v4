"use client";

import React, { useMemo } from "react";
import { RefreshCw, Clock, Database, ArrowUpCircle } from "lucide-react";

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
    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          SIGMA-Q | Dashboard Técnico
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <p style={{ opacity: 0.7, fontSize: "0.9rem", margin: 0 }}>
            Visão geral dinâmica de indicadores de qualidade.
          </p>
          
          {/* BADGE DE ÚLTIMA ATUALIZAÇÃO */}
          {lastUpdated && (
            <div style={{ 
              display: "flex", alignItems: "center", gap: 6, 
              fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500,
              background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <Clock size={13} />
              <span>Atualizado {formattedLastUpdated}</span>
              
              {/* Botão de Atualizar Manual */}
              <button 
                onClick={onRefresh}
                disabled={loading}
                title="Atualizar agora"
                style={{ 
                  background: "none", border: "none", cursor: "pointer", marginLeft: 4,
                  color: loading ? "#64748b" : "#3B82F6", display: "flex", alignItems: "center" 
                }}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ALERTA DE NOVOS DADOS (FLUTUANTE OU NO HEADER) */}
      {newDefectsCount > 0 && (
        <div 
          onClick={onRefresh}
          style={{
            background: "linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)",
            padding: "10px 16px", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            animation: "pulse 2s infinite"
          }}
        >
          <Database size={18} color="#fff" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
              Novos dados disponíveis
            </span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)" }}>
              +{newDefectsCount} defeitos encontrados
            </span>
          </div>
          <ArrowUpCircle size={20} color="#fff" />
        </div>
      )}

      {/* ESTILOS DE ANIMAÇÃO LOCAIS */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}