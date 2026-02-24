import {
  DiagnosticoIaTexto,
  DiagnosticoAiInput,
  InsightCard
} from "../../../app/development/diagnostico/hooks/diagnosticoTypes";

import {
  DiagnosticoPilares,
  calcularPilarSpike,
  calcularPilarMelhoria,
  calcularPilarReincidencia,
  calcularPilarRebote,
  calcularPilarTopOfensor,
  fmt,
  fmtPpm
} from "./pilares";

// Extensão do tipo de retorno para incluir os pilares e a nova estrutura
export type ResumoEstruturado = {
  contexto: string;
  tendenciaInfo: {
    tipo: "melhora" | "piora" | "estavel" | "indefinido";
    texto: string;
    valorPpm: string;
    percentual: string;
  } | null;
  acaoRecomendada: string | null;
  licaoAprendida?: string | null; // ✅ NOVO CAMPO
};

type DiagnosticoIaOutput = DiagnosticoIaTexto & {
  pilares: DiagnosticoPilares;
  resumoEstruturado?: ResumoEstruturado; 
};

export function gerarDiagnosticoAutomatico(
  input: DiagnosticoAiInput
): DiagnosticoIaOutput {
  const {
    periodoAtual,
    ppmContext,
    contexto,
    reincidencia,
    analiseSustentacao,
    mudancaBrusca 
  } = input;

  const resumoData = gerarTextoResumo(input);

  const mudancaBruscaEnriquecida = mudancaBrusca ? {
    ...mudancaBrusca,
    producaoAtual: ppmContext?.producaoAtual || 0
  } : null;

  const pilares: DiagnosticoPilares = {
    spike: calcularPilarSpike(mudancaBruscaEnriquecida), 
    melhoria: calcularPilarMelhoria(mudancaBrusca),
    reincidencia: calcularPilarReincidencia(reincidencia, periodoAtual),
    rebote: calcularPilarRebote(analiseSustentacao),
    topOfensor: calcularPilarTopOfensor(periodoAtual, ppmContext)
  };

  const insightsLegados = [
    pilares.spike,
    pilares.reincidencia,
    pilares.rebote,
    pilares.melhoria,
    pilares.topOfensor
  ].filter((c): c is InsightCard => c !== null);

  return {
    ...resumoData,
    insights: insightsLegados,
    pilares: pilares 
  };
}

/* ======================================================
   GERADOR DE TEXTO ESTRUTURADO
   ====================================================== */
function gerarTextoResumo(input: any) {
  const { periodoAtual, ppmContext } = input;
  const indicadores: string[] = [];

  const estrutura: ResumoEstruturado = {
    contexto: "",
    tendenciaInfo: null,
    acaoRecomendada: null
  };

  if (ppmContext.producaoAtual === 0) {
    return {
      titulo: "Sem Produção Registrada",
      resumoGeral: `Não identificamos apontamentos de produção para o período (Semana ${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}). Selecione outro período.`,
      resumoEstruturado: estrutura,
      tendencia: "indefinido" as const,
      variacaoPercentual: 0,
      indicadoresChave: []
    };
  }

  let variacaoPpmPercent = 0;
  let diferencaPpmAbsoluta = 0;
  let tendencia: "melhora" | "piora" | "estavel" | "indefinido" = "indefinido";

  if (ppmContext.anterior > 0) {
    diferencaPpmAbsoluta = ppmContext.atual - ppmContext.anterior;
    variacaoPpmPercent = (diferencaPpmAbsoluta / ppmContext.anterior) * 100;

    if (variacaoPpmPercent <= -5) tendencia = "melhora";
    else if (variacaoPpmPercent >= 5) tendencia = "piora";
    else tendencia = "estavel";
  } else if (ppmContext.atual > 0 && ppmContext.anterior === 0) {
    tendencia = "piora";
    variacaoPpmPercent = 100;
    diferencaPpmAbsoluta = ppmContext.atual;
  }

  // 1. Contexto
  estrutura.contexto = `No período analisado (semanas **${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}**), o agrupamento **${periodoAtual.principalCausa.nome}** foi o principal ofensor, concentrando **${fmt(periodoAtual.principalCausa.ocorrencias)}** ocorrências.`;

  // 2. Tendência
  if (tendencia !== "indefinido") {
    const sinal = diferencaPpmAbsoluta > 0 ? "+" : "";
    const txtPercent = `${sinal}${variacaoPpmPercent.toFixed(1)}%`;
    const txtAbsoluto = `${sinal}${fmtPpm(diferencaPpmAbsoluta)}`;
    const ppmAtualStr = fmtPpm(ppmContext.atual);
    const ppmAntStr = fmtPpm(ppmContext.anterior);

    let textoTendencia = "";
    if (tendencia === "melhora") {
      textoTendencia = `**Cenário Positivo:** Redução de **${txtAbsoluto} PPM** (${txtPercent}) comparado ao período anterior (${ppmAntStr} ➝ ${ppmAtualStr}). As ações de contenção demonstram efetividade.`;
    } else if (tendencia === "piora") {
      textoTendencia = `**Atenção (Degradação):** O processo oscilou negativamente, com aumento de **${txtAbsoluto} PPM** (${txtPercent}) (${ppmAntStr} ➝ ${ppmAtualStr}). Verifique as mudanças recentes no 4M.`;
    } else {
      textoTendencia = `**Estabilidade:** O PPM variou apenas **${txtAbsoluto} PPM** (${txtPercent}), mantendo-se no patamar de ${ppmAtualStr}. O processo está estável, mas exige novas ações para melhoria de nível.`;
    }

    estrutura.tendenciaInfo = {
      tipo: tendencia,
      texto: textoTendencia,
      valorPpm: txtAbsoluto,
      percentual: txtPercent
    };
  }

  // 3. Ação Recomendada
  if (periodoAtual.principalDefeito.nome) {
    estrutura.acaoRecomendada = `O defeito específico **${periodoAtual.principalDefeito.nome}** liderou os registros. Foque o Ishikawa prioritariamente neste item.`;
  }

  // ✅ 4. Histórico de Lições Aprendidas (Formatação Segura)
  if (input.licaoAprendida) {
    const p = input.licaoAprendida;
    
    // Constrói a frase dinamicamente para não mostrar espaços vazios caso a célula do Excel esteja em branco
    let textoLicao = `**Histórico (2025):** Este problema já foi tratado na categoria **${p.categoria}**. A análise apontou para **${p.analise}**`;
    
    if (p.descMotivo) {
        textoLicao += ` devido a "**${p.descMotivo}**"`;
    }
    textoLicao += ".";

    if (p.causaRaiz) {
        textoLicao += ` A Causa Raiz mapeada na época foi **${p.causaRaiz}**.`;
    }

    if (p.acao) {
        textoLicao += ` Ação de contenção recomendada: **${p.acao}**`;
    }

    if (p.responsavel) {
        textoLicao += ` (Área/Resp. Histórico: **${p.responsavel}**).`;
    } else if (p.acao) {
        textoLicao += "."; // Põe o ponto final se tiver ação mas não tiver responsável
    }

    estrutura.licaoAprendida = textoLicao;
  }

  indicadores.push(`PPM: ${fmtPpm(ppmContext.atual)}`);
  
  const titulos = {
      melhora: "Evolução Positiva de Qualidade",
      piora: "Alerta de Degradação",
      estavel: "Estabilidade de Processo",
      indefinido: "Diagnóstico Inicial"
  };

  const blocos = [estrutura.contexto, estrutura.tendenciaInfo?.texto, estrutura.acaoRecomendada, estrutura.licaoAprendida].filter(Boolean);

  return {
    titulo: titulos[tendencia] || "Diagnóstico do SIGMA-Q AI",
    resumoGeral: blocos.join("\n\n"), // Mantém compatibilidade
    resumoEstruturado: estrutura,     
    tendencia,
    variacaoPercentual: variacaoPpmPercent,
    indicadoresChave: indicadores
  };
}