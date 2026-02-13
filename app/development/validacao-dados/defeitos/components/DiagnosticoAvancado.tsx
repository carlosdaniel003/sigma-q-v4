"use client";

import React, { useMemo } from "react";
// ✅ Trocado o emoji pelo ícone Stethoscope e aprimorado o visual
import { AlertCircle, CheckCircle2, Activity, Info, Stethoscope, ChevronRight } from "lucide-react";

export default function DiagnosticoAvancado({ stats }: { stats: any }) {
  if (!stats) return null;

  const perBase = stats?.perBase ?? {};
  const totalInconsistencias = Number(stats?.notIdentified ?? 0);
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* ======================================================
      TABELA — BASES DINÂMICAS
  ====================================================== */
  const basesTable = useMemo(() => {
    const keys = Object.keys(perBase)
        .filter(k => k !== 'todas')
        .sort();

    return keys.map((k) => {
      const b = perBase[k] ?? {};
      const pct = Number(b?.percentIdentified ?? 0);

      return {
        key: k,
        total: b.total ?? 0,
        identified: b.identified ?? 0,
        notIdentified: b.notIdentified ?? 0,
        pct,
      };
    });
  }, [perBase]);

  /* ======================================================
      INSIGHTS OPERACIONAIS
  ====================================================== */
  const insights = useMemo(() => {
    const list: React.ReactNode[] = [];
    let hasIssues = false;

    // 1. ANÁLISE POR CATEGORIA (Dinâmica)
    basesTable.forEach((row) => {
      if (row.total === 0) return;

      if (row.pct < 99 && row.notIdentified > 0) {
        list.push(
          <div key={`low-${row.key}`} style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", 
            background: "rgba(239, 68, 68, 0.05)", borderLeft: "3px solid #ef4444", 
            borderRadius: "0 8px 8px 0", fontSize: "0.85rem", color: "#f8fafc", lineHeight: 1.5
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              Atenção à categoria <strong style={{ color: "#fca5a5" }}>{row.key.toUpperCase()}</strong>:{" "}
              {row.pct.toFixed(1)}% de identificação ({row.notIdentified} peças divergentes).
            </div>
          </div>
        );
        hasIssues = true;
      }
    });

    // 2. PARETO DE INCONSISTÊNCIAS
    if (totalInconsistencias > 0) {
      const maxKey = Object.keys(breakdown).reduce((a, b) =>
        breakdown[a] > breakdown[b] ? a : b
      );

      const maxCount = breakdown[maxKey];
      const impact = (maxCount / totalInconsistencias) * 100;

      if (impact > 50) {
        let label = "";
        let action = "";

        switch (maxKey) {
          case "responsabilidades":
            label = "Responsabilidades";
            action = "Padronizar códigos de fornecedor.";
            break;
          case "modelos":
            label = "Cadastro de Modelos";
            action = "Cadastrar novos produtos.";
            break;
          case "falhas":
            label = "Códigos de Falha / FMEA";
            action = "Atualizar dicionário e agrupamentos FMEA.";
            break;
          default:
            label = maxKey;
            action = "Revisar regras.";
        }

        list.push(
          <div key="pareto" style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", 
            background: "rgba(59, 130, 246, 0.05)", borderLeft: "3px solid #3b82f6", 
            borderRadius: "0 8px 8px 0", fontSize: "0.85rem", color: "#f8fafc", lineHeight: 1.5
          }}>
            <Info size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: "#93c5fd" }}>{impact.toFixed(0)}%</strong> do volume com problemas é proveniente de{" "}
              <strong style={{ color: "#93c5fd" }}>{label}</strong>. Sugestão Operacional: <em>{action}</em>
            </div>
          </div>
        );
        hasIssues = true;
      }
    }

    if (!hasIssues && basesTable.length > 0) {
      return (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "14px", 
          background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)", 
          borderRadius: 8, fontSize: "0.85rem", color: "#86efac", fontWeight: 500
        }}>
          <CheckCircle2 size={18} />
          Excelência Operacional: Todas as categorias estão devidamente rastreadas.
        </div>
      );
    }

    return list;
  }, [basesTable, breakdown, totalInconsistencias]);

  /* ======================================================
      RENDER
  ====================================================== */
  return (
    <section style={{
      marginTop: 32,
      background: "rgba(255, 255, 255, 0.01)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: 16,
      overflow: "hidden"
    }} className="fade-in">
      
      {/* HEADER: Substituído o emoji 🩺 por um design com ícones SVG */}
      <div style={{
        padding: "20px 24px",
        background: "linear-gradient(to right, rgba(147, 51, 234, 0.08), rgba(147, 51, 234, 0.01))",
        borderBottom: "1px solid rgba(147, 51, 234, 0.12)",
        display: "flex", alignItems: "flex-start", gap: 16
      }}>
        <div style={{ 
            background: "rgba(147, 51, 234, 0.12)", 
            padding: 10, 
            borderRadius: 12, 
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(147, 51, 234, 0.2)"
        }}>
            <Stethoscope color="#c084fc" size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#d8b4fe", fontWeight: 600, letterSpacing: 0.5 }}>
                DIAGNÓSTICO AVANÇADO
              </h3>
              <div style={{ 
                fontSize: "0.7rem", color: "#c084fc", background: "rgba(147, 51, 234, 0.08)", 
                padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(147, 51, 234, 0.2)",
                fontWeight: 600, textTransform: "uppercase"
              }}>
                 SQL 2026
              </div>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, marginTop: 8, maxWidth: "750px" }}>
            Visão consolidada da qualidade dos dados em todas as categorias de produtos e análise heurística do comportamento da base.
          </p>
        </div>
      </div>

      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* LADO ESQUERDO: Tabela Refinada */}
        <div>
           <div style={{ 
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 12, padding: "0 12px 12px", 
              fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 1.2, color: "#475569", fontWeight: 800,
              borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 12
          }}>
              <span>Categoria</span>
              <span style={{ textAlign: "right" }}>Volume</span>
              <span style={{ textAlign: "right" }}>Validadas</span>
              <span style={{ textAlign: "right" }}>Pendentes</span>
              <span style={{ textAlign: "right" }}>Qualidade</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {basesTable.map((b) => (
              <div key={b.key} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 12, alignItems: "center",
                padding: "10px 12px", background: "rgba(255,255,255,0.01)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: "0.85rem", color: "#e2e8f0" }}>
                  <ChevronRight size={14} color="#a855f7" opacity={0.6} />
                  {b.key.toUpperCase()}
                </div>
                <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#94a3b8" }}>{b.total}</div>
                <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#4ade80", fontWeight: 500 }}>{b.identified}</div>
                <div style={{ textAlign: "right", fontSize: "0.85rem", color: b.notIdentified > 0 ? "#f87171" : "#94a3b8", fontWeight: b.notIdentified > 0 ? 600 : 400 }}>
                  {b.notIdentified}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ 
                    fontSize: "0.75rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                    background: b.pct >= 99 ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)",
                    color: b.pct >= 99 ? "#4ade80" : "#fca5a5",
                    border: `1px solid ${b.pct >= 99 ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"}`
                  }}>
                    {b.pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {basesTable.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem", fontStyle: "italic" }}>
                  Nenhuma categoria processada ainda.
                </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: Insights Operacionais */}
        <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 20 }}>
          <div style={{ 
            display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", textTransform: "uppercase", 
            letterSpacing: 1.2, color: "#64748b", fontWeight: 800, marginBottom: 16
          }}>
            <Activity size={16} color="#a855f7" />
            Insights Automáticos da Operação
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {insights}
          </div>
        </div>

      </div>
    </section>
  );
}