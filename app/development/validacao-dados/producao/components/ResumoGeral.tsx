"use client";

import React, { useMemo } from "react";
import { 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Activity,
  Layers
} from "lucide-react";

import "./ResumoGeral-glass.css";

/**
 * RESUMO GERAL — PRODUÇÃO
 *
 * 🔑 REGRA DE OURO (CORREÇÃO):
 * - Aceita tanto:
 * • props.categories            (novo padrão / KPI)
 * • props.data.perCategory      (padrão antigo)
 * - Nunca depende de ajuste externo
 */
export default function ResumoGeral(props: any) {
  /* ============================================================
      🔁 ADAPTAÇÃO AUTOMÁTICA DE FONTE (CHAVE DA SOLUÇÃO)
   ============================================================ */
  const rawCategories =
    props.categories ??
    props.data?.perCategory ??
    [];

  const rawTopProblems =
    props.topProblems ??
    props.data?.topProblemModels ??
    [];

  const diagnostico =
    props.diagnostico ??
    props.data?.diagnostico ??
    {};

  const listaCategorias = Array.isArray(rawCategories) ? rawCategories : [];
  const listaProblemas = Array.isArray(rawTopProblems) ? rawTopProblems : [];

  /* ============================================================
      NORMALIZAÇÃO ROBUSTA
      - number | "98.5%" | "98.5" | null
   ============================================================ */
  const categoriasNorm = useMemo(() => {
    return listaCategorias.map((c: any) => {
      let pct = 0;

      if (typeof c.identifiedPct === "number") {
        pct = c.identifiedPct;
      } else if (typeof c.identifiedPct === "string") {
        pct = parseFloat(c.identifiedPct.replace("%", "").trim());
      }

      if (!Number.isFinite(pct)) pct = 0;

      return {
        ...c,
        identifiedPctNum: pct,
      };
    });
  }, [listaCategorias]);

  /* ============================================================
      DIAGNÓSTICO
   ============================================================ */
  const prodSemDef =
    diagnostico?.producaoSemDefeitos ??
    diagnostico?.semDefeitos ??
    diagnostico?.modelosSemDefeitos ??
    [];

  const defeitosSemProd =
    diagnostico?.defeitosSemProducao ??
    diagnostico?.semProducao ??
    [];

  /* ============================================================
      CLASSIFICAÇÃO (MESMA REGRA DO KPI)
   ============================================================ */
  const saudaveis = categoriasNorm.filter((c) => c.identifiedPctNum >= 99.9);
  const atencao = categoriasNorm.filter(
    (c) => c.identifiedPctNum >= 60 && c.identifiedPctNum < 99.9
  );
  const criticas = categoriasNorm.filter((c) => c.identifiedPctNum < 60);

  const modeloCritico = listaProblemas[0];

  /* ============================================================
      STATUS EXECUTIVO
   ============================================================ */
  const statusSistema = useMemo(() => {
    if (categoriasNorm.length === 0) {
      return {
        label: "Aguardando dados...",
        cor: "var(--muted)",
        desc: "Carregando análise de categorias",
        icon: <Activity size={20} />
      };
    }

    if (criticas.length > 0) {
      return {
        label: "Sistema em Estado Crítico",
        cor: "var(--danger)",
        desc: "Existem categorias com impacto direto nos indicadores",
        icon: <XCircle size={20} />
      };
    }

    if (atencao.length > 0) {
      return {
        label: "Sistema em Atenção",
        cor: "var(--warn)",
        desc: "Algumas categorias exigem monitoramento",
        icon: <AlertTriangle size={20} />
      };
    }

    return {
      label: "Sistema Estável",
      cor: "var(--success)",
      desc: "Categorias operando dentro do esperado",
      icon: <CheckCircle size={20} />
    };
  }, [categoriasNorm.length, criticas.length, atencao.length]);

  /* ============================================================
      INSIGHTS
   ============================================================ */
  const insight = useMemo(() => {
    if (categoriasNorm.length === 0) {
      return ["Nenhuma categoria encontrada."];
    }

    const linhas: string[] = [];

    linhas.push(
      `${saudaveis.length} de ${categoriasNorm.length} categorias estão totalmente saudáveis (100%).`
    );

    if (atencao.length > 0) {
      linhas.push(
        `${atencao.length} categoria(s) operam em zona de atenção (60%–99%).`
      );
    }

    if (criticas.length > 0) {
      const worst = [...criticas].sort(
        (a, b) => a.identifiedPctNum - b.identifiedPctNum
      )[0];

      linhas.push(
        `Categoria mais crítica: ${worst.categoria} (${worst.identifiedPctNum.toFixed(
          1
        )}%).`
      );
    }

    if (modeloCritico) {
      linhas.push(
        `Modelo mais difícil: ${modeloCritico.modelo} (${modeloCritico.count} ocorrências).`
      );
    }

    linhas.push(`Modelos sem defeitos: ${prodSemDef.length}.`);
    linhas.push(`Defeitos sem produção: ${defeitosSemProd.length}.`);

    return linhas;
  }, [
    categoriasNorm.length,
    saudaveis.length,
    atencao.length,
    criticas,
    modeloCritico,
    prodSemDef.length,
    defeitosSemProd.length,
  ]);

  /* ============================================================
      RENDER
   ============================================================ */
  return (
    <div
      className="fade-in"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* RESUMO EXECUTIVO */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h2
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BarChart3 size={20} /> Resumo Geral do Sistema
        </h2>

        <div
          style={{
            marginTop: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: `1px solid ${statusSistema.cor}`,
            borderRadius: 8
          }}
        >
            <div style={{ color: statusSistema.cor }}>
                {statusSistema.icon}
            </div>
            <div>
                <div style={{ fontWeight: 600, color: statusSistema.cor, fontSize: '1rem' }}>
                    {statusSistema.label}
                </div>
                <div className="muted small" style={{ marginTop: 2 }}>
                    {statusSistema.desc}
                </div>
            </div>
        </div>

        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {insight.map((txt, idx) => (
            <li key={idx} className="muted small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
               <Info size={14} style={{ opacity: 0.7, minWidth: 14 }} />
               {txt}
            </li>
          ))}
        </ul>
      </div>

      {/* MAPA DE INTEGRIDADE */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h3 className="section-title-small" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} /> Mapa de Integridade das Categorias
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <CategoryGroup
            titulo="Categorias Saudáveis"
            descricao="≥ 99.9% de precisão"
            cor="var(--success)"
            className="ok"
            items={saudaveis}
            icon={<CheckCircle size={16} />}
          />

          <CategoryGroup
            titulo="Categorias em Atenção"
            descricao="60% a 99%"
            cor="var(--warn)"
            className="warn"
            items={atencao}
            icon={<AlertTriangle size={16} />}
          />

          <CategoryGroup
            titulo="Categorias Críticas"
            descricao="< 60%"
            cor="var(--danger)"
            className="bad"
            items={criticas}
            icon={<XCircle size={16} />}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
    CATEGORY GROUP COMPONENT
 ============================================================ */
function CategoryGroup({ titulo, descricao, cor, className, items, icon }: any) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
          <h4 style={{ color: cor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            {icon}
            {titulo}
          </h4>
          <span className="muted small" style={{ fontSize: '0.75rem' }}>
            {descricao}
          </span>
      </div>

      {items.length === 0 ? (
        <p
          className="muted small"
          style={{ fontStyle: "italic", opacity: 0.6, padding: '8px 0' }}
        >
          Nenhuma categoria neste grupo.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((c: any) => (
            <div
              key={c.categoria}
              className="stat-card"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 16,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                className="cat-title-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <span
                  className="cat-title"
                  style={{ fontWeight: 600, fontSize: "0.95rem", color: 'var(--text-main)' }}
                >
                  {c.categoria}
                </span>

                <span
                  className={`cat-percent ${className}`}
                  style={{ color: cor, fontWeight: 700, fontSize: '1rem' }}
                >
                  {c.identifiedPctNum.toFixed(1)}%
                </span>
              </div>

              <div
                className="cat-subinfo"
                style={{
                  fontSize: "0.8rem",
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>Volume Total</span>
                <span style={{ fontFamily: 'monospace' }}>{c.volume?.toLocaleString() ?? 0} un.</span>
              </div>

              {/* Barra de Progresso */}
              <div
                style={{
                  height: 4,
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(c.identifiedPctNum, 5)}%`,
                    background: cor,
                    transition: "width .5s ease-out",
                    borderRadius: 4
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}