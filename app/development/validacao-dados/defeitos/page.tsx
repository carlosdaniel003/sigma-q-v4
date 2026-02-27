"use client";

import React from "react";
import "./defeitos-page-glass.css";
import { CheckCircle, FileSpreadsheet } from "lucide-react";

import useValidacaoDefeitos from "./hooks/useValidacaoDefeitos";

import SidebarDefeitos from "./components/SidebarDefeitos";
import KPIsDefeitos from "./components/KPIsDefeitos";
import PainelInconsistencias from "./components/PainelInconsistencias";
import DiagnosticoInteligente from "./components/DiagnosticoInteligente";
import DiagnosticoAvancado from "./components/DiagnosticoAvancado";
import AuditoriaNaoClassificados from "./components/AuditoriaNaoClassificados"; 

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

  const showKPIs = fonte === "todas";
  const baseInfo = fonte !== "todas" ? perBase?.[fonte] : null;

  const isBase100 =
    fonte !== "todas" &&
    baseInfo &&
    Number(baseInfo.percentIdentified) === 100;

  const nomeBase = fonte === "todas" ? "VISÃO GERAL" : fonte.toUpperCase();

  return (
    <div className="defeitos-container">

      <SidebarDefeitos
        fonte={fonte}
        setFonte={(f) => setFonte(f as any)}
        perBase={perBase}
      />

      <main className="defeitos-main">

        <header className="defeitos-header">
          <div>
            <h2 className="defeitos-title">
              Validação de Defeitos 
              <span className="defeitos-sql">
                SQL 2026
              </span>
            </h2>
            <div className="defeitos-subtitle">
              Motor de Validação & Enriquecimento de Dados
            </div>
          </div>

          <button 
            onClick={() => baixarComoExcel(`SIGMA_Dados_Brutos_SQL2026`)}
            className="export-btn"
            title="Baixar dados em .xlsx direto do SQL"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel Bruto
          </button>
        </header>

        {isBase100 && (
          <section className="friendly-box">
            <div className="friendly-icon">
              <CheckCircle size={48} strokeWidth={1.5} />
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

        {!isBase100 && (
          <>
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
                </section>
              </>
            )}

            <DiagnosticoInteligente
              diag={diag}
              diagFilter={diagFilter}
              setDiagFilter={setDiagFilter}
            />

            {showKPIs && (
              <DiagnosticoAvancado stats={stats} />
            )}

            <AuditoriaNaoClassificados fonte={fonte} />
          </>
        )}
      </main>
    </div>
  );
}