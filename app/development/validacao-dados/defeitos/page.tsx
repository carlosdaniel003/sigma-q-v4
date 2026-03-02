/* app\development\validacao-dados\defeitos\page.tsx */
"use client";

import React, { useState, useEffect } from "react";
import "./defeitos-page-glass.css";
// ✅ Importamos o ícone de Loader2 para a nova animação
import { CheckCircle, FileSpreadsheet, Loader2 } from "lucide-react";

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

  // 🔥 NOVO: Estado para controlar o Overlay de Carregamento Glassmorphism
  const [isSwitching, setIsSwitching] = useState(false);

  // Desliga o carregamento automaticamente assim que os dados novos chegam
  useEffect(() => {
    setIsSwitching(false);
  }, [diag, breakdown, total]);

  // Intercepta o clique na sidebar para ligar a animação
  const handleSetFonte = (novaFonte: string) => {
    if (novaFonte === fonte) return; // Não faz nada se clicar na mesma categoria
    setIsSwitching(true);
    setFonte(novaFonte as any);
    
    // Fallback de segurança: desliga após 2s caso a base seja vazia e não dispare o useEffect
    setTimeout(() => setIsSwitching(false), 2000);
  };

  const showKPIs = fonte === "todas";
  const baseInfo = fonte !== "todas" ? perBase?.[fonte] : null;

  const isBase100 =
    fonte !== "todas" &&
    baseInfo &&
    Number(baseInfo.percentIdentified) === 100;

  const nomeBase = fonte === "todas" ? "VISÃO GERAL" : fonte.toUpperCase();

  return (
    <div className="defeitos-container">
      {/* Estilos seguros apenas para a animação do Loader local */}
      <style>{`
        @keyframes glassFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        .glass-loader-spin {
          animation: glassSpin 1s linear infinite;
        }
        @keyframes glassSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <SidebarDefeitos
        fonte={fonte}
        setFonte={handleSetFonte} // 🔥 Usamos a nova função aqui
        perBase={perBase}
      />

      {/* Adicionado position: relative para conter o Overlay perfeitamente */}
      <main className="defeitos-main" style={{ position: "relative" }}>
        
        {/* 🔥 OVERLAY DE CARREGAMENTO GLASSMORPHISM */}
        {isSwitching && (
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "24px",
            animation: "glassFadeIn 0.2s ease-out forwards"
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "32px 48px",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
            }}>
              <Loader2 className="glass-loader-spin" size={42} color="#60A5FA" style={{ marginBottom: 16 }} />
              <span style={{ color: "#f8fafc", fontSize: "1.1rem", fontWeight: 700, letterSpacing: 0.5, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                Sincronizando {nomeBase}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 8, fontWeight: 500 }}>
                Consultando motor de IA...
              </span>
            </div>
          </div>
        )}

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