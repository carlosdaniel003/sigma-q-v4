"use client";

import React from "react";
import { Factory, AlertTriangle, CheckCircle } from "lucide-react";

import "./producao-premium.css";
import { useValidacao } from "./hooks/useValidacao";

// 🔑 CONTEXTO DE PRODUÇÃO
import { useProductionData } from "../context/ProductionContext";

// COMPONENTES
import KPIsGerais from "./components/KPIsGerais";
import SidebarCategorias from "./components/SidebarCategorias";
import ResumoGeral from "./components/ResumoGeral";
import DiagnosticoGeral from "./components/DiagnosticoGeral";
import DetalhamentoPorModelo from "./components/DetalhamentoPorModelo";
import InsightInteligente from "./components/InsightInteligente";

export default function ProducaoPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const {
    loading,
    error,

    overall,
    categories,

    categoriasSaudaveis,
    categoriasAtencao,
    categoriasCriticas,

    selectedCategory,
    setSelectedCategory,

    currentStats,
    diagnostico,
    baseProducao,

    currentProblems, // 🔑 problemas reais (topProblemModels) com o trace detalhado
  } = useValidacao();

  // 🔑 contexto compartilhado
  const { setProductionData } = useProductionData();

  /* ============================================================
      📌 GRAVA BASE DE PRODUÇÃO NO CONTEXTO (1x)
      ============================================================ */
  React.useEffect(() => {
    if (!loading && Array.isArray(baseProducao) && baseProducao.length > 0) {
      setProductionData(baseProducao);
    }
  }, [loading, baseProducao, setProductionData]);

  /* ============================================================
      REGRAS DE VISUALIZAÇÃO
      ============================================================ */
  const isVisaoGeral = selectedCategory === null;

  const categoriaInfo = selectedCategory
    ? categories.find(
        (c: any) =>
          String(c.categoria ?? "").toUpperCase() ===
          String(selectedCategory).toUpperCase()
      )
    : null;

  const isCategoria100 =
    categoriaInfo && Number(categoriaInfo.identifiedPct ?? 0) === 100;

  /* ============================================================
      ERRO
      ============================================================ */
  if (error) {
    return (
      <div className="producao-wrapper fade-in">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 40 }}>
            <AlertTriangle size={48} className="text-danger" />
            <p className="error-text" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{error}</p>
        </div>
      </div>
    );
  }

  /* ============================================================
      PÁGINA
      ============================================================ */
  return (
    <div className="producao-wrapper fade-in">
      {/* HEADER */}
      <header className="page-header">
        <h1>
          <Factory size={28} className="text-brand" />
          Validação de Produção
        </h1>

        <div className="muted small">
          Automático •{" "}
          {overall?.totalVolume?.toLocaleString()} unidades analisadas
        </div>
      </header>

      {/* LAYOUT */}
      <div className="split-view">
        {/* SIDEBAR */}
        <SidebarCategorias
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* PAINEL DIREITO */}
        <main className="right-panel custom-scroll">
          {/* =========================
              VISÃO GERAL
              ========================= */}
          {isVisaoGeral && (
            <>
              {/* KPIs */}
              <div className="kpis-wrapper">
                <KPIsGerais
                  overall={overall}
                  categories={categories}
                  categoriasSaudaveis={categoriasSaudaveis}
                  categoriasAtencao={categoriasAtencao}
                  categoriasCriticas={categoriasCriticas}
                  modelosSemDefeitos={
                    diagnostico?.producaoSemDefeitos?.length ?? 0
                  }
                  // ✅ Passamos explicitamente apenas os críticos (Grupo A)
                  defeitosSemProducaoCriticos={
                    diagnostico?.defeitosSemProducao?.length ?? 0
                  }
                />
              </div>

              {/* RESUMO GERAL */}
              <ResumoGeral
                categories={categories}
                topProblems={currentProblems}
                diagnostico={diagnostico}
              />

              {/* DIAGNÓSTICO DETALHADO (NOVA TAXONOMIA A, B, C) */}
              {diagnostico && (
                <DiagnosticoGeral
                  data={{
                    perCategory: categories,
                  }}
                  diagnostico={diagnostico}
                />
              )}
            </>
          )}

          {/* =========================
              CATEGORIA 100% (VISUAL NOVO)
              ========================= */}
          {!isVisaoGeral && isCategoria100 && (
            <section className="friendly-box fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '16px',
                marginTop: '20px'
            }}>
              <div className="friendly-icon" style={{ marginBottom: '16px' }}>
                  <CheckCircle size={56} className="text-success" strokeWidth={1.5} />
              </div>
              <h3 className="friendly-title" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Categoria Saudável
              </h3>
              <p className="friendly-text" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                A categoria <strong style={{ color: 'var(--success)' }}>{selectedCategory}</strong> não possui
                inconsistências.
              </p>
              <p className="friendly-subtext" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Todos os registros foram identificados corretamente pelo
                motor SIGMA-Q.
              </p>
            </section>
          )}

          {/* =========================
              CATEGORIA COM PROBLEMAS
              ========================= */}
          {!isVisaoGeral && !isCategoria100 && currentStats && (
            <div
              className="glass-card fade-in"
              style={{ padding: 20, marginTop: 20 }}
            >
              <DetalhamentoPorModelo
                categoria={selectedCategory}
                stats={currentStats}
              />

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  margin: "25px 0",
                }}
              />

              {/* ✅ CORREÇÃO: Passando topProblems para habilitar o Trace Detalhado */}
              <InsightInteligente
                categoria={selectedCategory}
                stats={currentStats}
                diagnostico={diagnostico}
                overall={overall}
                topProblems={currentProblems} 
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}