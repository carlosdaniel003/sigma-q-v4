"use client";
/* app\development\validacao-dados\producao\page.tsx*/
import React, { useEffect } from "react";
import { Factory, AlertTriangle, CheckCircle } from "lucide-react";
import "./producao-page-glass.css";
//import "./producao-premium.css";
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
import ExportarExcelProducao from "./components/ExportarExcelProducao"; 

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
  useEffect(() => {
    if (!loading && Array.isArray(baseProducao) && baseProducao.length > 0) {
      // ✅ CORREÇÃO DE PERFORMANCE: O setTimeout de 150ms liberta a "Main Thread"
      // permitindo que o navegador desenhe e anime a Sidebar primeiro, 
      // antes de processar o armazenamento da base de dados pesada.
      const timer = setTimeout(() => {
         setProductionData(baseProducao);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [loading, baseProducao, setProductionData]);

// ProducaoPage.tsx — adicionar junto aos outros useEffects

useEffect(() => {
  // 🔥 Força o browser a recalcular o layout do grid/flex
  // Resolve o bug de KPIs empilhados na primeira renderização
  const timer = setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 50);

  return () => clearTimeout(timer);
}, []); // ← roda apenas 1x ao montar

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
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Factory size={28} className="text-brand" />
          Validação de Produção
        </h1>

        <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Automático • {overall?.totalVolume?.toLocaleString()} unidades analisadas</span>
          
          {/* ✅ COMPONENTE ISOLADO DE EXPORTAÇÃO */}
          <ExportarExcelProducao baseProducao={baseProducao} />
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
                  key={`kpis-${loading ? "loading" : "ready"}`} // 🔥 força remount quando dados chegam
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