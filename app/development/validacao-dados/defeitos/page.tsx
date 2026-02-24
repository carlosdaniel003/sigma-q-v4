// app/development/validacao-dados/defeitos/page.tsx
"use client";

import React from "react";
import "./defeitos-premium.css";
// Import dos ícones SVG
import { CheckCircle, FileSpreadsheet } from "lucide-react";

// Hook
import useValidacaoDefeitos from "./hooks/useValidacaoDefeitos";

// Componentes
import SidebarDefeitos from "./components/SidebarDefeitos";
import KPIsDefeitos from "./components/KPIsDefeitos";
import PainelInconsistencias from "./components/PainelInconsistencias";
import DiagnosticoInteligente from "./components/DiagnosticoInteligente";
// ✅ DiagnosticoAvancado no lugar de PerformancePorBase
import DiagnosticoAvancado from "./components/DiagnosticoAvancado";
import AuditoriaNaoClassificados from "./components/AuditoriaNaoClassificados"; 

// ✅ Import da função de exportação para Excel
import { baixarComoExcel } from "./components/exportToExcel";

export default function DefeitosPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const {
    fonte,
    setFonte,

    diagFilter,
    setDiagFilter,

    stats,
    diag,

    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  } = useValidacaoDefeitos();

  /* ======================================================
     REGRAS DE VISUALIZAÇÃO
   ====================================================== */

  const showKPIs = fonte === "todas";

  const baseInfo = fonte !== "todas" ? perBase?.[fonte] : null;
  
  const isBase100 =
    fonte !== "todas" &&
    baseInfo &&
    Number(baseInfo.percentIdentified) === 100;

  // Nome amigável para exibição
  const nomeBase = fonte === "todas" ? "VISÃO GERAL" : fonte.toUpperCase();

  return (
    <div className="defeitos-container">
      {/* SIDEBAR */}
      <SidebarDefeitos
        fonte={fonte}
        // Ajuste técnico: Cast para garantir que aceite qualquer string do SQL
        setFonte={(f) => setFonte(f as any)}
        perBase={perBase}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="defeitos-main">
        
        {/* HEADER MODIFICADO COM BOTÃO DE EXPORTAR */}
        <header className="defeitos-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 className="defeitos-title">
              Validação de Defeitos 
              <span style={{ fontSize: '0.6em', opacity: 0.6, marginLeft: '10px', fontWeight: 'normal' }}>
                SQL 2026
              </span>
            </h2>
            <div className="defeitos-subtitle">
              Motor de Validação & Enriquecimento de Dados
            </div>
          </div>

          {/* ✅ BOTÃO EXPORTAR EXCEL */}
          {/* ✅ BOTÃO EXPORTAR EXCEL */}
          <button 
            onClick={() => baixarComoExcel(`SIGMA_Dados_Brutos_SQL2026`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(16, 185, 129, 0.15)", // Fundo verde translúcido
              color: "#34d399", // Texto verde claro
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
              marginTop: "4px"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)")}
            title="Baixar dados em .xlsx direto do SQL"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel Bruto
          </button>
        </header>

        {/* =========================
            BASE 100% → MENSAGEM AMIGÁVEL (SVG)
        ========================= */}
        {isBase100 && (
          <section className="friendly-box fade-in">
            <div className="friendly-icon">
              <CheckCircle size={48} strokeWidth={1.5} style={{ color: "var(--success)" }} />
            </div>
            <h3 className="friendly-title">
              Qualidade Máxima Atingida
            </h3>
            <p className="friendly-text">
              A categoria <strong>{nomeBase}</strong> não possui
              nenhuma inconsistência pendente.
            </p>
            <p className="friendly-subtext">
              Todos os registros foram identificados corretamente pelo
              motor SIGMA-Q.
            </p>
          </section>
        )}

        {/* =========================
            VISUALIZAÇÃO NORMAL
        ========================= */}
        {!isBase100 && (
          <>
            {/* KPIs (somente TODAS) */}
            {showKPIs && (
              <>
                <KPIsDefeitos
                  total={total}
                  totalDefeitos={totalDefeitos}
                  notIdentified={notIdentified}
                  aiOverall={aiOverall}
                />

                <section className="breakdown-grid">
                  <PainelInconsistencias breakdown={breakdown} />
                  {/* PerformancePorBase foi removido daqui e o Painel de Inconsistências
                      agora assumirá a organização de layout natural do CSS */}
                </section>
              </>
            )}

            {/* Diagnóstico Inteligente */}
            <DiagnosticoInteligente
              diag={diag}
              diagFilter={diagFilter}
              setDiagFilter={setDiagFilter}
            />

            {/* ✅ Diagnóstico Avançado posicionado exatamente onde você pediu: 
                 Abaixo do Diagnóstico Inteligente e Acima da Auditoria FMEA.
                 Ele é exibido na Visão Geral (showKPIs) consolidando todas as bases. */}
            {showKPIs && (
              <DiagnosticoAvancado stats={stats} />
            )}

            {/* Auditoria FMEA */}
            <AuditoriaNaoClassificados fonte={fonte} />

          </>
        )}
      </main>
    </div>
  );
}