"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Cpu } from "lucide-react";
import "./PrincipaisCausas-glass.css"; // ✅ NOVO CSS IMPORTADO

/* ======================================================
   TIPAGEM
====================================================== */
interface PosicaoItem {
  nome: string;
  ocorrencias: number;
}

interface ModeloItem {
  nome: string;
  ocorrencias: number;
  posicoes?: PosicaoItem[];
}

interface AnaliseItem {
  nome: string;
  ocorrencias: number;
  modelos?: ModeloItem[];
}

interface AgrupamentoItem {
  nome: string;
  ocorrencias: number;
  detalhes?: AnaliseItem[];
}

interface PrincipaisCausasProps {
  data?: AgrupamentoItem[];
  onSelectPosition: (analise: string, modelo: string, posicao: string) => void;
}

export default function PrincipaisCausas({
  data,
  onSelectPosition
}: PrincipaisCausasProps) {
  
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [expandedAnalise, setExpandedAnalise] = useState<string | null>(null);
  const [expandedModelo, setExpandedModelo] = useState<string | null>(null);

  const toggleGroup = (index: number) => {
    setExpandedGroup(expandedGroup === index ? null : index);
    if (expandedGroup === index) {
        setExpandedAnalise(null);
        setExpandedModelo(null);
    }
  };

  const toggleAnalise = (key: string) => {
    setExpandedAnalise(expandedAnalise === key ? null : key);
    if (expandedAnalise === key) setExpandedModelo(null);
  };

  const toggleModelo = (key: string) => {
    setExpandedModelo(expandedModelo === key ? null : key);
  };

  const listaCausas = data || [];

  return (
    <div className="causas-container">
      
      {/* TÍTULO */}
      <div className="causas-header">
        <h3 className="causas-title">
          Principais Causas
        </h3>
        <span className="causas-subtitle">
          Drill-down (4 Níveis)
        </span>
      </div>

      {/* ESTADO VAZIO */}
      {listaCausas.length === 0 && (
        <span className="causas-empty">
          Nenhuma causa crítica identificada para os filtros aplicados.
        </span>
      )}

      {/* ================= NÍVEL 1: AGRUPAMENTO ================= */}
      {listaCausas.map((group, groupIdx) => {
        const isGroupOpen = expandedGroup === groupIdx;
        const rankClass = groupIdx === 0 ? "rank-1" : groupIdx === 1 ? "rank-2" : "rank-3";

        return (
          <div key={groupIdx} className="lvl1-group-wrapper">
            
            <div
              onClick={() => toggleGroup(groupIdx)}
              className={`lvl1-card ${rankClass} ${isGroupOpen ? "is-open" : ""}`}
            >
              <span className="lvl1-rank-num">
                #{groupIdx + 1}
              </span>

              <div className="lvl1-info">
                  <span className="lvl1-name">{group.nome}</span>
                  <span className="lvl1-hint">
                      {isGroupOpen ? "Clique para fechar" : "Clique para explorar raízes"}
                  </span>
              </div>

              <span className="lvl1-count">
                {group.ocorrencias.toLocaleString("pt-BR")}
              </span>
            </div>

            {/* ================= NÍVEL 2: ANÁLISE ================= */}
            {isGroupOpen && group.detalhes && (
              <div className="lvl2-wrapper">
                <div className="lvl2-label">
                    Principais Análises:
                </div>

                {group.detalhes.map((analise, analiseIdx) => {
                    const analiseKey = `${groupIdx}-${analiseIdx}`;
                    const isAnaliseOpen = expandedAnalise === analiseKey;
                    const hasModelos = analise.modelos && analise.modelos.length > 0;

                    return (
                        <div key={analiseIdx}>
                            <div 
                                onClick={() => hasModelos && toggleAnalise(analiseKey)}
                                className={`lvl2-card ${hasModelos ? "clickable" : ""} ${isAnaliseOpen ? "is-open" : ""}`}
                            >
                                <div className="lvl2-info">
                                    {hasModelos && (
                                        isAnaliseOpen ? <ChevronDown size={16} color="#94a3b8"/> : <ChevronRight size={16} color="#94a3b8"/>
                                    )}
                                    <span className="lvl2-name">
                                        {analise.nome}
                                    </span>
                                </div>
                                <span className="lvl2-count">{analise.ocorrencias}</span>
                            </div>

                            {/* ================= NÍVEL 3: MODELO ================= */}
                            {isAnaliseOpen && hasModelos && (
                                <div className="lvl3-wrapper">
                                    {analise.modelos!.map((modelo, modeloIdx) => {
                                        const modeloKey = `${analiseKey}-${modeloIdx}`;
                                        const isModeloOpen = expandedModelo === modeloKey;
                                        const hasPosicoes = modelo.posicoes && modelo.posicoes.length > 0;

                                        return (
                                            <div key={modeloIdx}>
                                                <div 
                                                    onClick={() => hasPosicoes && toggleModelo(modeloKey)}
                                                    className={`lvl3-card ${hasPosicoes ? "clickable" : ""} ${isModeloOpen ? "is-open" : ""}`}
                                                >
                                                    <div className="lvl3-info">
                                                        <Cpu size={14} color={isModeloOpen ? "#60a5fa" : "#64748b"} />
                                                        <span className="lvl3-name">
                                                            {modelo.nome}
                                                        </span>
                                                    </div>
                                                    <span className="lvl3-count">
                                                        {modelo.ocorrencias}
                                                    </span>
                                                </div>

                                                {/* ================= NÍVEL 4: POSIÇÃO ================= */}
                                                {isModeloOpen && hasPosicoes && (
                                                    <div className="lvl4-wrapper">
                                                        {modelo.posicoes!.map((pos, posIdx) => (
                                                            <div 
                                                                key={posIdx}
                                                                onClick={() => onSelectPosition(analise.nome, modelo.nome, pos.nome)}
                                                                className="lvl4-pill"
                                                            >
                                                                <MapPin size={12} color="#fcd34d" />
                                                                <span className="lvl4-pill-name">
                                                                    {pos.nome}
                                                                </span>
                                                                <span className="lvl4-pill-count">
                                                                    ({pos.ocorrencias})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}