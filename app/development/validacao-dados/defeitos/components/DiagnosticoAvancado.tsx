"use client";

import React, { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Activity,
  Info,
  Stethoscope,
  ChevronRight
} from "lucide-react";

import "./DiagnosticoAvancado-glass.css";

export default function DiagnosticoAvancado({ stats }: { stats: any }) {
  if (!stats) return null;

  const perBase = stats?.perBase ?? {};
  const totalInconsistencias = Number(stats?.notIdentified ?? 0);
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  const basesTable = useMemo(() => {
    const keys = Object.keys(perBase)
      .filter(k => k !== "todas")
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

  const insights = useMemo(() => {
  const list: React.ReactNode[] = [];
  let hasIssues = false;

  /* ======================================================
     1️⃣ ANÁLISE POR CATEGORIA
  ====================================================== */
  basesTable.forEach((row) => {
    if (row.total === 0) return;

    if (row.pct < 99 && row.notIdentified > 0) {
      list.push(
        <div key={`low-${row.key}`}>
          <AlertCircle size={16} color="#ef4444" />
          Atenção à categoria <strong>{row.key.toUpperCase()}</strong>:{" "}
          {row.pct.toFixed(1)}% de identificação ({row.notIdentified} peças divergentes).
        </div>
      );
      hasIssues = true;
    }
  });

  /* ======================================================
     2️⃣ PARETO DAS INCONSISTÊNCIAS
  ====================================================== */
  if (totalInconsistencias > 0) {
    const keys = Object.keys(breakdown);
    if (keys.length > 0) {
      const maxKey = keys.reduce((a, b) =>
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
          <div key="pareto" className="diagav-pareto">
            <Info size={16} color="#3b82f6" />
            <strong>{impact.toFixed(0)}%</strong> do volume com problemas é proveniente de{" "}
            <strong>{label}</strong>. Sugestão Operacional: <em>{action}</em>
          </div>
        );
        hasIssues = true;
      }
    }
  }

  /* ======================================================
     3️⃣ EXCELÊNCIA
  ====================================================== */
  if (!hasIssues && basesTable.length > 0) {
    return (
      <div>
        <CheckCircle2 size={18} color="#22c55e" />
        Excelência Operacional: Todas as categorias estão devidamente rastreadas.
      </div>
    );
  }

  return list;
}, [basesTable, breakdown, totalInconsistencias]);

  return (
    <section className="diagav-card fade-in">

      <div className="diagav-header">
        <div className="diagav-icon-wrapper">
          <Stethoscope color="#c084fc" size={24} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="diagav-title">
              DIAGNÓSTICO AVANÇADO
            </h3>
            <div className="diagav-badge">
              SQL 2026
            </div>
          </div>

          <p className="diagav-subtitle">
            Visão consolidada da qualidade dos dados em todas as categorias de produtos.
          </p>
        </div>
      </div>

      <div className="diagav-body">

        <div>
          <div className="diagav-table-header">
            <span>Categoria</span>
            <span style={{ textAlign: "right" }}>Volume</span>
            <span style={{ textAlign: "right" }}>Validadas</span>
            <span style={{ textAlign: "right" }}>Pendentes</span>
            <span style={{ textAlign: "right" }}>Qualidade</span>
          </div>

          {basesTable.map((b) => (
            <div key={b.key} className="diagav-table-row">
              <div className="diagav-cat">
                <ChevronRight size={14} color="#a855f7" opacity={0.6} />
                {b.key.toUpperCase()}
              </div>

              <div className="diagav-number">{b.total}</div>
              <div className="diagav-identified">{b.identified}</div>

              <div
                className="diagav-notid"
                style={{
                  color: b.notIdentified > 0 ? "#f87171" : "#94a3b8",
                  fontWeight: b.notIdentified > 0 ? 600 : 400
                }}
              >
                {b.notIdentified}
              </div>

              <div className="diagav-quality">
                <span
                  className="diagav-quality-badge"
                  style={{
                    background:
                      b.pct >= 99
                        ? "rgba(74,222,128,0.15)"
                        : "rgba(248,113,113,0.15)",
                    color:
                      b.pct >= 99
                        ? "#4ade80"
                        : "#fca5a5",
                    border: `1px solid ${
                      b.pct >= 99
                        ? "rgba(74,222,128,0.3)"
                        : "rgba(248,113,113,0.3)"
                    }`
                  }}
                >
                  {b.pct.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="diagav-insights">
          <div className="diagav-insights-header">
            <Activity size={16} color="#a855f7" />
            Insights Automáticos da Operação
          </div>

          {insights}
        </div>

      </div>

    </section>
  );
}