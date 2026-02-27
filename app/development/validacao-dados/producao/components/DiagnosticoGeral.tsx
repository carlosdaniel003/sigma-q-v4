"use client";
import "./DiagnosticoGeral-glass.css";
import React, { useMemo } from "react";
import { 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  FlaskConical, 
  Component, 
  SearchX,
  ShieldCheck 
} from "lucide-react";

type Props = {
  data: any; // Mantido para compatibilidade, mas vamos focar no diagnostico
  diagnostico: any;
};

export default function DiagnosticoGeral({ data, diagnostico }: Props) {
  if (!diagnostico) return null;

  const categorias = data?.perCategory ?? [];

  // 1) CATEGORIAS CRÍTICAS (< 90%)
  const categoriasCriticas = useMemo(() => {
    return categorias
      .filter((c: any) => Number(c.identifiedPct) < 90)
      .sort((a: any, b: any) => a.identifiedPct - b.identifiedPct);
  }, [categorias]);

  // 2) GRUPOS DA NOVA TAXONOMIA
  // Estes nomes devem bater EXATAMENTE com o retorno do route.ts
  const { 
    defeitosSemProducao = [], // GRUPO A (Crítico - TV-xxx)
    preProducao = [],         // GRUPO B1 (Atenção - Evaporadores)
    producaoParcial = [],     // GRUPO B2 (Atenção - Placas)
    producaoComDefeitos = [], // GRUPO C (Normal - TM-1200)
    producaoSemDefeitos = []  // NORMAL (Sem Defeitos)
  } = diagnostico;

  return (
    <div className="glass-card fade-in" style={{ marginTop: 20, padding: 24 }}>

      <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Layers size={22} className="text-brand" />
        Diagnóstico Inteligente • Visão Geral
      </h2>
      <p className="muted small" style={{ marginBottom: 30, marginLeft: 32 }}>
        Análises automáticas sobre falhas estruturais, discrepâncias de produção e categorias que exigem revisão.
      </p>

      {/* ============================================================
          1) TABELA — Categorias Críticas
      ============================================================ */}
      {categoriasCriticas.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h3 className="section-title-small" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertTriangle size={18} />
            Categorias Críticas — Detalhamento
          </h3>
          <div className="glass-table-container" style={{ marginTop: 12 }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Volume Total</th>
                  <th>Identificados</th>
                  <th>Não Identificados</th>
                  <th>% Precisão</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categoriasCriticas.map((c: any, i: number) => {
                  const pct = Number(c.identifiedPct);
                  return (
                    <tr key={i}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{c.categoria}</strong></td>
                      <td>{c.volume.toLocaleString()}</td>
                      <td style={{ color: "var(--success)" }}>{c.identifiedRows}</td>
                      <td style={{ color: "var(--danger)" }}>{c.notIdentifiedRows}</td>
                      <td style={{ fontWeight: 600 }}>{pct.toFixed(1)}%</td>
                      <td><span className="status-tag bad" style={{ fontSize: '0.7rem' }}>REVISAR</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          🔴 GRUPO A: ERROS PROPOSITAIS (CRÍTICO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--danger)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <SearchX size={18} />
          Erros de Validação (Críticos)
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Modelos com defeitos registrados mas sem produção. <strong>Impactam o KPI.</strong>
        </p>

        {defeitosSemProducao.length === 0 ? (
          <div className="empty-state">
             <CheckCircle2 size={16} style={{ opacity: 0.5 }} />
             Nenhum erro crítico detectado.
          </div>
        ) : (
          <div className="grid-list">
            {defeitosSemProducao.map((d: any, i: number) => (
              <div key={i} className="diag-item danger">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge danger">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">Motivo: {d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟡 GRUPO B1: INCONSISTÊNCIA NA PRODUÇÃO (ATENÇÃO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--warn)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={18} />
          Produtos em Engenharia / Inconsistência na Produção
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Itens em cadastro ou teste inicial. <strong>Não impactam KPI global.</strong>
        </p>

        {preProducao.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={16} style={{ opacity: 0.5 }} />
            Nenhum item inconsistente na produção.
          </div>
        ) : (
          <div className="grid-list">
            {preProducao.map((d: any, i: number) => (
              <div key={i} className="diag-item warn">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge warn">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">{d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟡 GRUPO B2: PRODUÇÃO PARCIAL (ATENÇÃO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "#f59e0b", display: 'flex', alignItems: 'center', gap: 8 }}>
          <Component size={18} />
          Produção Parcial
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Produção incompleta (ex: placa ok, produto não). <strong>Monitoramento necessário.</strong>
        </p>

        {producaoParcial.length === 0 ? (
          <div className="empty-state">
             <CheckCircle2 size={16} style={{ opacity: 0.5 }} />
             Nenhum caso de produção parcial.
          </div>
        ) : (
          <div className="grid-list">
            {producaoParcial.map((d: any, i: number) => (
              <div key={i} className="diag-item warn-orange">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge warn-orange">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">{d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟢 GRUPO C: PRODUÇÃO COM DEFEITOS (NORMAL)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--success)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          Produção com Defeitos (Fluxo Normal)
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Itens produzidos e identificados corretamente no fluxo.
        </p>

        {producaoComDefeitos.length === 0 ? (
          <div className="empty-state">Nenhum fluxo normal com defeitos detectado.</div>
        ) : (
          <div className="grid-list">
            {producaoComDefeitos.map((d: any, i: number) => (
              <div key={i} className="diag-item success">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge success">{d.ocorrencias} Defeitos</span>
                </div>
                <div className="diag-reason">Produção Identificada • Match OK</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟢 PRODUÇÃO SEM DEFEITOS (NORMAL - SEM DEFEITO)
      ============================================================ */}
      <div>
        <h3 className="section-title-small" style={{ color: "var(--success)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} />
          Produção sem Defeitos (Ideal)
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Modelos produzidos com zero apontamentos de falha.
        </p>

        {producaoSemDefeitos.length === 0 ? (
          <div className="empty-state">Nenhum modelo sem defeitos.</div>
        ) : (
          <div className="grid-list">
            {producaoSemDefeitos.map((d: any, i: number) => (
              <div key={i} className="diag-item success-light">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge success-light">{Number(d.produzido).toLocaleString()} UN</span>
                </div>
                <div className="diag-reason">Zero defeitos registrados</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}