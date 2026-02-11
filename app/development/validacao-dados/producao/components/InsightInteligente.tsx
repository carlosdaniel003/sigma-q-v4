"use client";

import React from "react";
import { Lightbulb, Search, AlertTriangle, FileQuestion } from "lucide-react";

export default function InsightInteligente({ categoria, stats, diagnostico, overall }: any) {
  // Verificação de segurança para evitar renderização sem dados
  if (!stats || !stats.models || !diagnostico) return null;

  // Filtra apenas modelos com falhas de identificação (onde notIdentifiedRows > 0)
  const naoIdentificados = stats.models.filter(
    (m: any) => m.notIdentifiedRows > 0
  );

  // Se não houver modelos não identificados, não renderiza nada
  if (naoIdentificados.length === 0) return null;

  const totalSistema = overall?.totalRows ?? 0;

  return (
    <div className="insight-wrapper fade-in">
      
      {/* TÍTULO DA SEÇÃO */}
      <div className="insight-header">
        <Lightbulb size={20} className="icon" />
        <h2>Insight Inteligente — Itens Não Identificados</h2>
      </div>

      <p className="insight-subtitle">
        Análise automática baseada em padrões de erro, inconsistências entre produção e defeitos e comportamento real da fábrica.
      </p>

      {/* LISTA DE MODELOS COM PROBLEMAS */}
      <div className="insight-list">
        {naoIdentificados.map((m: any, i: number) => {
          
          // Calcula a porcentagem de impacto deste erro no volume total do sistema
          const impactoSistema = totalSistema
            ? ((m.notIdentifiedRows / totalSistema) * 100).toFixed(3) + "%"
            : "—";

          // Chama a função de análise para obter causa e sugestão
          const analise = analisarModelo(m, diagnostico);

          return (
            <div key={i} className="insight-card">
              
              {/* Cabeçalho do Card: Nome do Modelo e Impacto */}
              <div className="insight-card-header">
                <strong className="model">{m.modelKey}</strong>
                <span className="pct" title="Impacto no volume total de produção">{impactoSistema}</span>
              </div>

              {/* Quantidade de Itens Afetados */}
              <div className="insight-qty">
                {m.notIdentifiedRows} itens não identificados • {m.identifiedRows} identificados
              </div>

              {/* Causa Provável */}
              <div className="insight-row">
                <Search size={16} className="icon cause" />
                <p className="insight-text">
                  <strong>Causa provável:</strong> {analise.causa}
                </p>
              </div>

              {/* Sugestão de Ação */}
              <div className="insight-row">
                {/* Ícone dinâmico baseado no tipo de problema */}
                {analise.tipo === "cadastro" ? (
                   <FileQuestion size={16} className="icon warn" />
                ) : (
                   <AlertTriangle size={16} className="icon warn" />
                )}
                <p className="insight-text">
                  <strong>Sugestão:</strong> {analise.sugestao}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   FUNÇÃO DE ANÁLISE (INTELIGÊNCIA REAL)
   Integra dados estatísticos com a taxonomia do sistema (Grupos A, B, C)
============================================================ */

function analisarModelo(m: any, diagnostico: any) {
  const nome = m.modelKey;
  // Total de itens deste modelo (identificados + não identificados)
  const total = m.identifiedRows + m.notIdentifiedRows;
  
  // 0. ERRO DE CADASTRO/GRAFIA (Prioridade Alta)
  // Se NENHUM item foi identificado (0% de precisão), é quase certo que o nome está errado ou falta no cadastro.
  if (m.identifiedRows === 0 && m.notIdentifiedRows > 0) {
    return {
      tipo: "cadastro",
      causa: `O sistema não encontrou NENHUMA correspondência para o modelo "${nome}" no catálogo oficial (0% de precisão).`,
      sugestao: "Verificar se há erro de digitação (espaços, hífens) na produção ou se o modelo falta no cadastro oficial."
    };
  }

  // 1. GRUPO B1: INCONSISTÊNCIA NA PRODUÇÃO (Verifica se está na lista de INCONSISTÊNCIA)
  const isPreProd = diagnostico?.preProducao?.find((d: any) => d.modelo === nome);
  if (isPreProd) {
    return {
      tipo: "pre-producao",
      causa: "Item classificado como Engenharia/Inconsistência na Produção (ex: EVAPORADOR, CONDENSADOR).",
      sugestao: "Este item não deve ter produção final registrada. Acompanhar apenas se houver desvio de qualidade."
    };
  }

  // 2. GRUPO B2: PRODUÇÃO PARCIAL (Verifica se está na lista de produção parcial)
  const isParcial = diagnostico?.producaoParcial?.find((d: any) => d.modelo === nome);
  if (isParcial) {
    return {
      tipo: "parcial",
      causa: "Produção Parcial identificada (ex: Placa produzida, produto final não).",
      sugestao: "Verificar se o processo produtivo foi concluído ou se há represamento de semi-acabados."
    };
  }

  // 3. GRUPO A: ERRO PROPOSITAL (Verifica se é um erro de teste conhecido)
  const isErroTeste = diagnostico?.defeitosSemProducao?.find((d: any) => d.modelo === nome);
  if (isErroTeste) {
    return {
      tipo: "teste",
      causa: "Erro de validação identificado. Item de teste sem produção real.",
      sugestao: "Confirmar se este é um teste de sistema. Se for produção real, cadastrar o modelo corretamente."
    };
  }

  // 4. DIVERGÊNCIA NUMÉRICA (Defeitos > Produção)
  // Busca dados de divergência para este modelo
  const diverg = diagnostico?.divergencias?.find((d: any) => d.modelo === nome);
  const defeitosApontados = diverg?.defeitosApontados ?? 0;
  // Se não houver divergência registrada, assume a produção total encontrada
  const produzido = diverg?.produzido ?? total;

  if (defeitosApontados > produzido && defeitosApontados > 0) {
    return {
      tipo: "defeitos",
      causa: `Os defeitos apontados (${defeitosApontados}) excedem a produção real (${produzido}). Indício de erro de apontamento.`,
      sugestao: "Revisar planilha de defeitos. Verificar lançamentos duplicados ou modelo incorreto."
    };
  }

  // 5. BAIXO VOLUME (Fallback para casos com algum match parcial mas baixa confiança)
  if (produzido < 20) {
    return {
      tipo: "producao",
      causa: "Pouca referência histórica na produção para validar este padrão com segurança.",
      sugestao: "Aumentar base histórica ou confirmar manualmente se a grafia está correta."
    };
  }

  // 6. DEFAULT (Caso genérico)
  return {
    tipo: "geral",
    causa: "Padrões disponíveis insuficientes para identificação segura.",
    sugestao: "Revisar cadastro do modelo e garantir consistência nos apontamentos de produção."
  };
}