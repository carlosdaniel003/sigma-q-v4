"use client";

import React, { useMemo } from "react";
import { useCatalogo } from "./hooks/useCatalogo";
import { CatalogoHeader } from "./components/CatalogoHeader";
import { CatalogoSearch } from "./components/CatalogoSearch";
import { CatalogoCards } from "./components/CatalogoCards";
import { CatalogoTable } from "./components/CatalogoTable";

export default function CatalogoOficialPage() {
  const {
    buscaGlobal,
    setBuscaGlobal,
    catalogo,
    dados,
    resultadosBusca,
    temBusca,
    carregarCatalogo,
  } = useCatalogo();

  /* ======================================================
     LÓGICA DE FILTRO CONTEXTUAL
     Se um catálogo está aberto, filtramos os 'dados' locais.
     Se não, a busca é global através do 'resultadosBusca'.
  ====================================================== */
  const dadosFiltradosContextuais = useMemo(() => {
    if (!catalogo || !temBusca) return dados;

    return dados.filter((item: any) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(buscaGlobal.toLowerCase())
    );
  }, [dados, buscaGlobal, catalogo, temBusca]);

  return (
    <div className="catalogo-container">
      {/* Input de busca com placeholder dinâmico */}
      <CatalogoSearch 
        value={buscaGlobal} 
        onChange={setBuscaGlobal} 
        placeholder={
          catalogo 
            ? `Filtrar em ${catalogo.toUpperCase()}...` 
            : "Pesquisar em todos os catálogos..."
        }
      />

      {/* 1. MODO PESQUISA GLOBAL (Nenhum card selecionado + Tem texto de busca) */}
      {!catalogo && temBusca && (
        <>
          <CatalogoHeader title="Resultados da Pesquisa Global" />
          {Object.entries(resultadosBusca).map(([nome, lista]) =>
            lista.length > 0 ? (
              <CatalogoTable key={nome} title={nome} dados={lista} />
            ) : null
          )}
        </>
      )}

      {/* 2. MODO SELEÇÃO (Nenhum card selecionado + Sem busca) */}
      {!temBusca && !catalogo && (
        <CatalogoCards onSelect={carregarCatalogo} />
      )}

      {/* 3. MODO VISUALIZAÇÃO DE CATÁLOGO (Card Selecionado) */}
      {catalogo && (
        <div className="fade-in">
          {/* Botão para voltar à seleção de cards */}
          <button 
            onClick={() => carregarCatalogo("")}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            ← Voltar aos Catálogos
          </button>
          
          <CatalogoTable 
            title={temBusca ? `Filtrando ${catalogo.toUpperCase()}: "${buscaGlobal}"` : catalogo.toUpperCase()} 
            dados={dadosFiltradosContextuais} 
          />
        </div>
      )}

      <style jsx>{`
        .catalogo-container {
          width: 100%;
          animation: fadeIn 0.5s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}