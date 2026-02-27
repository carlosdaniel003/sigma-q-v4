"use client";

import { useState } from "react";
import SidebarFiltros from "./components/SidebarFiltros";
import KpiPrincipalCausa from "./components/KpiPrincipalCausa"; 
import KpiPrincipalDefeito from "./components/KpiPrincipalDefeito"; 
import KpiDefeitoCritico from "./components/KpiDefeitoCritico";
import KpiStatusGeral from "./components/KpiStatusGeral"; 
import DefeitosCriticosNpr from "./components/DefeitosCriticosNpr";
import PrincipaisCausas from "./components/PrincipaisCausas";
import DiagnosticoIaTexto from "./components/DiagnosticoIaTexto";
import DiagnosticoLoading from "./components/DiagnosticoLoading";
import DefectDetailsDrawer from "./components/DefectDetailsDrawer";

import { useDiagnosticoIa } from "./hooks/useDiagnosticoIa";
import { useDiagnosticoFilters } from "./store/diagnosticoFilters"; 

import { BarChart3, Award, Lightbulb } from "lucide-react"; 

// ✅ NOVO CSS IMPORTADO
import "./page-diagnostico-glass.css";

/* ======================================================
   MÓDULO: MENSAGEM DE "SEM PRODUÇÃO"
====================================================== */
function EmptyProductionState() {
  return (
    <div className="empty-prod-card fade-in">
      <div className="empty-prod-icon">
        <BarChart3 size={48} color="#94a3b8" strokeWidth={1.5} />
      </div>
      <h2 className="empty-prod-title">
        Não houve produção neste período
      </h2>
      <p className="empty-prod-desc">
        O sistema não encontrou registros de produção para os filtros selecionados (Categoria/Modelo/Data). 
        Sem produção, não é possível calcular indicadores de qualidade (PPM) ou risco.
      </p>
      <div className="empty-prod-tip">
        <Lightbulb size={16} /> Dica: Tente selecionar um período anterior ou outro modelo.
      </div>
    </div>
  );
}

/* ======================================================
   MÓDULO: MENSAGEM DE "EXCELÊNCIA (ZERO DEFEITOS)"
====================================================== */
function ExcellenceState() {
  return (
    <div className="excellence-card fade-in">
      <div className="excellence-icon">
        <Award size={56} color="#34d399" strokeWidth={1.5} />
      </div>
      <h2 className="excellence-title">
        Excelência em Qualidade
      </h2>
      <div className="excellence-subtitle">
        Zero Defeitos Registrados
      </div>
      <p className="excellence-desc">
        Parabéns! Houve produção registrada para este período, mas <strong>nenhuma falha</strong> foi apontada. 
        O processo demonstrou robustez total nos filtros selecionados.
      </p>
      <div className="excellence-badge">
        PPM 0,00
      </div>
    </div>
  );
}


/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */
export default function DiagnosticoIaPage() {
  const { data, loading, error } = useDiagnosticoIa();
  const { filters } = useDiagnosticoFilters(); 

  // ✅ ESTADOS DO DRAWER DE DETALHES
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerRows, setDrawerRows] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  /* ======================================================
     ✅ LÓGICA DE CLICK ATUALIZADA (3 PARÂMETROS)
  ====================================================== */
  const handleSelectPosition = async (analise: string, modelo: string, posicao: string) => {
    setIsDrawerOpen(true);
    setDrawerTitle(`Causa: ${analise} | Mod: ${modelo} | Pos: ${posicao}`);
    setDrawerLoading(true);
    setDrawerRows([]); 

    try {
        const params = new URLSearchParams();
        
        // 1. Filtros de Tempo
        if (filters.periodo.tipo && filters.periodo.valor && filters.periodo.ano) {
            params.set("periodoTipo", filters.periodo.tipo);
            params.set("periodoValor", String(filters.periodo.valor));
            params.set("ano", String(filters.periodo.ano));
        }
        
        // 2. Filtros de Dimensão
        if (filters.turno && filters.turno !== "Todos") params.set("turno", filters.turno);
        if (filters.categoria && filters.categoria !== "Todos") params.set("categoria", filters.categoria);
        
        // 3. Filtros Específicos do Drill-down
        params.set("analise", analise); 
        params.set("modelo", modelo);
        params.set("posicao", posicao); 

        // 4. Chamada à API de detalhes
        const res = await fetch(`/api/diagnostico/detalhes?${params.toString()}`);
        
        if (res.ok) {
            const json = await res.json();
            setDrawerRows(json.rows || []);
        } else {
            console.error("❌ Erro ao buscar detalhes técnicos do SQL");
        }
    } catch (err) {
        console.error("❌ Erro no fetch de detalhes:", err);
    } finally {
        setDrawerLoading(false);
    }
  };

  /* ======================================================
      LÓGICA DE ESTADOS ESPECIAIS (IA)
  ====================================================== */
  const tituloIa = data?.diagnosticoIa?.titulo;
  
  const isSemProducao = tituloIa === "Sem Produção Registrada";
  const isZeroDefeitos = tituloIa === "Excelência em Qualidade";

  /* ======================================================
      LAYOUT BASE (COM SIDEBAR)
  ====================================================== */
  return (
    <div className="diag-page-layout fade-in">
      {/* ✅ COMPONENTE DRAWER */}
      <DefectDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerTitle}
        loading={drawerLoading}
        rows={drawerRows}
      />

      {/* SIDEBAR FIXA A ESQUERDA */}
      <SidebarFiltros />

      {/* ÁREA DE CONTEÚDO */}
      <div className="diag-content-area">
        
        {/* CABEÇALHO */}
        <div className="diag-header">
          <h1 className="diag-title">Diagnóstico de IA</h1>
          <p className="diag-subtitle">
            Análise inteligente de falhas e riscos baseada em FMEA e histórico.
          </p>
        </div>

        {/* ESTADOS DE CARREGAMENTO / ERRO / VAZIO */}
        
        {loading && (
            <div style={{ marginTop: 40 }}>
                <DiagnosticoLoading />
            </div>
        )}
        
        {error && <div style={{ padding: 20, color: "#ef4444" }}>Erro: {error}</div>}

        {!loading && !error && !data && (
          <div className="diag-prompt-empty fade-in">
            Selecione os filtros na barra lateral para gerar o diagnóstico.
          </div>
        )}

        {/* DASHBOARD RENDERIZADO */}
        {!loading && data && (
          <>
            {/* 1️⃣ CENÁRIO: SEM PRODUÇÃO */}
            {isSemProducao ? (
                <EmptyProductionState />
            ) : isZeroDefeitos ? (
                /* 2️⃣ CENÁRIO: EXCELÊNCIA (ZERO DEFEITOS) */
                <ExcellenceState />
            ) : (
                /* 3️⃣ CENÁRIO: PADRÃO (COM DADOS) */
                <>
                    {/* LINHA 1: KPIS SUPERIORES */}
                    <div className="diag-kpi-row">
                      <KpiDefeitoCritico data={data.defeitoCritico} />
                      <KpiPrincipalCausa data={data.principalCausa} />
                      <KpiPrincipalDefeito data={data.principalDefeito} />
                      <KpiStatusGeral data={data.statusGeral} />
                    </div>

                    {/* LINHA 2: BLOCOS CENTRAIS (Listas) */}
                    <div className="diag-charts-row">
                      <DefeitosCriticosNpr data={data.defeitosCriticos} />
                      
                      <PrincipaisCausas 
                        data={data.principaisCausas} 
                        onSelectPosition={handleSelectPosition}
                      />
                    </div>

                    {/* LINHA 3: DIAGNÓSTICO IA (Texto) */}
                    <div className="diag-ia-row">
                        <DiagnosticoIaTexto data={data.diagnosticoIa} />
                    </div>
                </>
            )}
          </>
        )}
      </div>
    </div>
  );
}