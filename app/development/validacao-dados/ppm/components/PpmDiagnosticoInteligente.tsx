"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  AlertTriangle, 
  SearchX, 
  TrendingDown, 
  BrainCircuit, 
  Target, 
  Info 
} from "lucide-react";

interface DiagnosticoItem {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;

  // 🔒 PRECISÃO DA CATEGORIA (não do item)
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

  /* ======================================================
      LISTA DE CATEGORIAS (INTELIGENTE)
      - 1 categoria → SEM GERAL
      - >1 categorias → COM GERAL
   ====================================================== */
  const categoriasList = useMemo(() => {
    if (categoriasUnicas.length <= 1) {
      return categoriasUnicas;
    }
    return ["GERAL", ...categoriasUnicas];
  }, [categoriasUnicas]);

  /* ======================================================
      CATEGORIA ATIVA (REAGE AO CONTEXTO)
   ====================================================== */
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  // 🔥 SINCRONIZA SEMPRE QUE OS ITEMS MUDAREM
  useEffect(() => {
    if (categoriasList.length === 1) {
      setCategoriaAtiva(categoriasList[0]);
    } else {
      setCategoriaAtiva("GERAL");
    }
  }, [categoriasList]);

  /* ======================================================
      FILTRO DOS ITENS
   ====================================================== */
  const itensFiltrados = useMemo(() => {
    if (!categoriaAtiva || categoriaAtiva === "GERAL") return items;
    return items.filter((i) => i.categoria === categoriaAtiva);
  }, [items, categoriaAtiva]);

  /* ======================================================
      SEM INCONSISTÊNCIAS
   ====================================================== */
  if (items.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', marginTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <BrainCircuit size={40} style={{ color: 'var(--success)', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Diagnóstico Inteligente</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Nenhuma inconsistência encontrada. O KPI não está sendo impactado.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ padding: 24, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <BrainCircuit size={22} className="text-brand" />
          <h3 className="section-title" style={{ margin: 0 }}>Diagnóstico Inteligente — Impacto real no KPI</h3>
      </div>
      <p className="muted small" style={{ marginLeft: 32, marginBottom: 20 }}>
        Cada item abaixo representa uma parcela real da perda de precisão da IA
        dentro da sua categoria.
      </p>

      {/* ======================================================
          TABS DE CATEGORIA (SÓ QUANDO FAZ SENTIDO)
       ====================================================== */}
      {categoriasList.length > 1 && (
        <div className="diagnostic-tabs" style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 20, 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: 12,
            overflowX: 'auto'
        }}>
          {categoriasList.map((cat) => {
             const isActive = categoriaAtiva === cat;
             const count = cat === "GERAL"
                  ? items.length
                  : metricasPorCategoria[cat]?.totalItens || 0;

             return (
                <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                style={{
                    background: isActive ? 'var(--brand)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 20,
                    padding: '6px 16px',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                }}
                >
                {cat}
                <span style={{ 
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', 
                    borderRadius: 10, 
                    padding: '2px 6px', 
                    fontSize: '0.7rem' 
                }}>
                    {count}
                </span>
                </button>
            );
          })}
        </div>
      )}

      {/* ======================================================
          LISTAGEM DOS DIAGNÓSTICOS
       ====================================================== */}
      <div className="diagnostic-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {itensFiltrados.map((i) => {
            // Calcula métricas para exibição (mesma lógica)
            const metrics = metricasPorCategoria; // Apenas para passar tipagem se precisar, mas aqui não usamos direto no map além do calculo
            const impacto = calcularImpactoItem(i.categoria, metrics);

          return (
            <div key={i.groupKey} className="diagnostic-card" style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: 12, 
                padding: 16,
                position: 'relative',
                overflow: 'hidden'
            }}>
              {/* Header do Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{i.categoria}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{i.modelo}</div>
                </div>

                <span style={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    color: 'var(--danger)', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '4px 8px', 
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}>
                  <TrendingDown size={14} />
                  −{impacto.toFixed(1)}% KPI
                </span>
              </div>

              {/* Métricas Internas */}
              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 8, 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: 10, 
                  borderRadius: 8,
                  marginBottom: 12
              }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Produção</div>
                    <div style={{ fontWeight: 600 }}>{i.produzido.toLocaleString()}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Defeitos</div>
                    <div style={{ fontWeight: 600 }}>{i.defeitos.toLocaleString()}</div>
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 6, marginTop: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PPM Calculado</span>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{i.ppm.toFixed(2)}</span>
                    </div>
                </div>
              </div>

              {/* Descrição / Motivo */}
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
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
        <div style={{ display: 'flex', gap: 10 }}>
            <SearchX size={20} className="text-danger" style={{ minWidth: 20 }} />
            <div>
                <strong style={{ color: 'var(--danger)' }}>Defeitos sem produção registrada.</strong>
                <p style={{ margin: '4px 0', fontSize: '0.8rem', opacity: 0.7 }}>
                    Existem defeitos registrados para este modelo, porém nenhuma produção correspondente foi encontrada.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-strong)' }}>
                    <Target size={12} />
                    <span>Recomendação: verificar grafia do modelo.</span>
                </div>
            </div>
        </div>
      );

    case "PPM_ZERADO":
      return (
        <div style={{ display: 'flex', gap: 10 }}>
            <AlertTriangle size={20} className="text-warn" style={{ minWidth: 20 }} />
            <div>
                <strong style={{ color: 'var(--warn)' }}>PPM inválido.</strong>
                <p style={{ margin: '4px 0', fontSize: '0.8rem', opacity: 0.7 }}>
                    O cálculo foi comprometido por inconsistência entre produção e defeitos.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-strong)' }}>
                    <Info size={12} />
                    <span>Recomendação: revisar dados de entrada.</span>
                </div>
            </div>
        </div>
      );

    case "DADOS_INCOMPLETOS":
      return (
        <div style={{ display: 'flex', gap: 10 }}>
            <AlertTriangle size={20} className="text-muted" style={{ minWidth: 20 }} />
            <div>
                <strong style={{ color: 'var(--text-muted)' }}>Dados incompletos.</strong>
                <p style={{ margin: '4px 0', fontSize: '0.8rem', opacity: 0.7 }}>
                    Não foi possível validar produção nem defeitos para este item.
                </p>
            </div>
        </div>
      );

    default:
      return null;
  }
}