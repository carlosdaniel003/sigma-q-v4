"use client";

import React, { useMemo } from "react";
import { AlertCircle, CheckCircle2, Activity, Info } from "lucide-react";

export default function DiagnosticoAvancado({ stats }: { stats: any }) {
  if (!stats) return null;

  const perBase = stats?.perBase ?? {};
  const totalInconsistencias = Number(stats?.notIdentified ?? 0);
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* ======================================================
      TABELA — BASES DINÂMICAS
  ====================================================== */
  const basesTable = useMemo(() => {
    // Pega todas as chaves, remove "todas" e ordena
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
      if (row.total === 0) return; // Ignora vazias

      if (row.pct < 99 && row.notIdentified > 0) {
        list.push(
          <div key={`low-${row.key}`} className="insight-danger">
            <AlertCircle size={16} />
            Atenção à categoria <strong>{row.key.toUpperCase()}</strong>:{" "}
            {row.pct.toFixed(1)}% de identificação ({row.notIdentified} erros).
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
            label = "Códigos de Falha";
            action = "Atualizar dicionário de falhas.";
            break;
          default:
            label = maxKey;
            action = "Revisar regras.";
        }

        list.push(
          <div key="pareto" className="insight-info">
            <Info size={16} />
            <span>
              <strong>{impact.toFixed(0)}%</strong> dos problemas são de{" "}
              <strong>{label}</strong>. Sugestão: {action}
            </span>
          </div>
        );
        hasIssues = true;
      }
    }

    if (!hasIssues && basesTable.length > 0) {
      return (
        <div className="insight-success">
          <CheckCircle2 size={16} />
          Excelência Operacional: Todas as categorias estão acima de 99%.
        </div>
      );
    }

    return list;
  }, [basesTable, breakdown, totalInconsistencias]);

  /* ======================================================
      RENDER
  ====================================================== */
  return (
    <section className="diag-adv-card fade-in">
      <h4 className="diag-adv-title">
        🩺 Diagnóstico Avançado (SQL 2026)
      </h4>

      <div className="diag-adv-scroll">
        <table className="diag-adv-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Itens</th>
              <th>Identificados</th>
              <th>Pendentes</th>
              <th>Qualidade</th>
            </tr>
          </thead>
          <tbody>
            {basesTable.map((b) => (
              <tr key={b.key}>
                <td className="bold">{b.key.toUpperCase()}</td>
                <td>{b.total}</td>
                <td className="green">{b.identified}</td>
                <td
                  className={
                    b.notIdentified > 0 ? "red" : "muted"
                  }
                >
                  {b.notIdentified}
                </td>
                <td>{b.pct.toFixed(2)}%</td>
              </tr>
            ))}
            {basesTable.length === 0 && (
                <tr>
                    <td colSpan={5} style={{textAlign: 'center', color: '#999'}}>
                        Nenhuma categoria processada ainda.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="diag-adv-insight">
        <div className="diag-adv-insight-header">
          <Activity size={14} />
          Insights Automáticos
        </div>
        <div className="diag-adv-insight-list">
          {insights}
        </div>
      </div>
    </section>
  );
}