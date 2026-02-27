"use client";

import "./ppm-diagnostico-glass.css";
import React, { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  SearchX,
  TrendingDown,
  BrainCircuit,
  Target,
  Info,
} from "lucide-react";

interface DiagnosticoItem {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;
  precision: number;
  reason: "SEM_PRODUCAO" | "PPM_ZERADO" | "DADOS_INCOMPLETOS";
}

interface Props {
  items: DiagnosticoItem[];
}

export default function PpmDiagnosticoInteligente({ items }: Props) {
  /* ======================================================
      MÉTRICAS POR CATEGORIA (FONTE ÚNICA)
   ====================================================== */
  const metricasPorCategoria = useMemo(() => {
    const map: Record<
      string,
      {
        totalItens: number;
        precision: number;
      }
    > = {};

    items.forEach((i) => {
      if (!map[i.categoria]) {
        map[i.categoria] = {
          totalItens: 0,
          precision: i.precision,
        };
      }
      map[i.categoria].totalItens += 1;
    });

    return map;
  }, [items]);

  const categoriasUnicas = Object.keys(metricasPorCategoria);

  const categoriasList = useMemo(() => {
    if (categoriasUnicas.length <= 1) {
      return categoriasUnicas;
    }
    return ["GERAL", ...categoriasUnicas];
  }, [categoriasUnicas]);

  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  useEffect(() => {
    if (categoriasList.length === 1) {
      setCategoriaAtiva(categoriasList[0]);
    } else {
      setCategoriaAtiva("GERAL");
    }
  }, [categoriasList]);

  const itensFiltrados = useMemo(() => {
    if (!categoriaAtiva || categoriaAtiva === "GERAL") return items;
    return items.filter((i) => i.categoria === categoriaAtiva);
  }, [items, categoriaAtiva]);

  /* ======================================================
      SEM INCONSISTÊNCIAS
   ====================================================== */
  if (items.length === 0) {
    return (
      <div className="diagnostic-glass-card empty">
        <div className="diagnostic-empty-content">
          <BrainCircuit size={40} className="diagnostic-empty-icon" />
          <h3 className="diagnostic-empty-title">
            Diagnóstico Inteligente
          </h3>
        </div>
        <p className="diagnostic-empty-text">
          Nenhuma inconsistência encontrada. O KPI não está sendo impactado.
        </p>
      </div>
    );
  }

  return (
    <div className="diagnostic-glass-card fade-in">
      <div className="diagnostic-header">
        <BrainCircuit size={22} className="diagnostic-header-icon" />
        <h3 className="section-title">
          Diagnóstico Inteligente — Impacto real no KPI
        </h3>
      </div>

      <p className="diagnostic-sub">
        Cada item abaixo representa uma parcela real da perda de precisão da IA
        dentro da sua categoria.
      </p>

      {categoriasList.length > 1 && (
        <div className="diagnostic-tabs">
          {categoriasList.map((cat) => {
            const isActive = categoriaAtiva === cat;
            const count =
              cat === "GERAL"
                ? items.length
                : metricasPorCategoria[cat]?.totalItens || 0;

            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`diagnostic-tab-btn ${
                  isActive ? "active" : ""
                }`}
              >
                {cat}
                <span className="diagnostic-tab-count">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="diagnostic-list">
        {itensFiltrados.map((i) => {
          const metrics = metricasPorCategoria;
          const impacto = calcularImpactoItem(i.categoria, metrics);

          return (
            <div key={i.groupKey} className="diagnostic-card">
              <div className="diagnostic-card-header">
                <div>
                  <div className="diagnostic-category">
                    {i.categoria}
                  </div>
                  <div className="diagnostic-model">
                    {i.modelo}
                  </div>
                </div>

                <span className="diagnostic-impact">
                  <TrendingDown size={14} />
                  −{impacto.toFixed(1)}% KPI
                </span>
              </div>

              <div className="diagnostic-metrics">
                <div>
                  <div className="diagnostic-metric-label">
                    Produção
                  </div>
                  <div className="diagnostic-metric-value">
                    {i.produzido.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="diagnostic-metric-label">
                    Defeitos
                  </div>
                  <div className="diagnostic-metric-value">
                    {i.defeitos.toLocaleString()}
                  </div>
                </div>

                <div className="diagnostic-ppm">
                  <div className="diagnostic-ppm-row">
                    <span>PPM Calculado</span>
                    <span>{i.ppm.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="diagnostic-description">
                {renderDiagnosticText(i)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================
    CÁLCULO DO IMPACTO REAL POR ITEM
 ====================================================== */
function calcularImpactoItem(
  categoria: string,
  metricas: Record<
    string,
    { totalItens: number; precision: number }
  >
) {
  const info = metricas[categoria];
  if (!info || info.totalItens === 0) return 0;

  const deficit = 100 - info.precision;
  return deficit / info.totalItens;
}

/* ======================================================
    TEXTO INTELIGENTE DE DIAGNÓSTICO
 ====================================================== */
function renderDiagnosticText(i: DiagnosticoItem) {
  switch (i.reason) {
    case "SEM_PRODUCAO":
      return (
        <div className="diagnostic-reason">
          <SearchX size={20} className="text-danger" />
          <div>
            <strong className="text-danger">
              Defeitos sem produção registrada.
            </strong>
            <p>
              Existem defeitos registrados para este modelo, porém nenhuma produção correspondente foi encontrada.
            </p>
            <div className="diagnostic-recommendation">
              <Target size={12} />
              <span>Recomendação: verificar grafia do modelo.</span>
            </div>
          </div>
        </div>
      );

    case "PPM_ZERADO":
      return (
        <div className="diagnostic-reason">
          <AlertTriangle size={20} className="text-warn" />
          <div>
            <strong className="text-warn">
              PPM inválido.
            </strong>
            <p>
              O cálculo foi comprometido por inconsistência entre produção e defeitos.
            </p>
            <div className="diagnostic-recommendation">
              <Info size={12} />
              <span>Recomendação: revisar dados de entrada.</span>
            </div>
          </div>
        </div>
      );

    case "DADOS_INCOMPLETOS":
      return (
        <div className="diagnostic-reason">
          <AlertTriangle size={20} className="text-muted" />
          <div>
            <strong className="text-muted">
              Dados incompletos.
            </strong>
            <p>
              Não foi possível validar produção nem defeitos para este item.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}