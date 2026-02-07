import {
  DiagnosticoIaTexto,
  DiagnosticoAiInput,
  InsightCard
} from ".../../app/development/diagnostico/hooks/diagnosticoTypes"; 

/* ======================================================
   INTERFACE LOCAL DOS PILARES
   (Idealmente, mova isso para seu arquivo de types)
   ====================================================== */
export interface DiagnosticoPilares {
  spike: InsightCard | null;        // Pilar 1: Mudança Brusca (Piora)
  melhoria: InsightCard | null;     // Pilar 2: Melhoria Significativa
  reincidencia: InsightCard | null; // Pilar 3: Alerta de Reincidência
  rebote: InsightCard | null;       // Pilar 4: Efeito Rebote
  topOfensor: InsightCard | null;   // Pilar 5: Atenção Imediata
}

// Extensão do tipo de retorno para incluir os pilares
type DiagnosticoIaOutput = DiagnosticoIaTexto & {
  pilares: DiagnosticoPilares;
};

// Helpers de formatação
const fmt = (n: number) => n.toLocaleString("pt-BR");
const fmtPpm = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function gerarDiagnosticoAutomatico(
  input: DiagnosticoAiInput
): DiagnosticoIaOutput { // ✅ Retorno tipado com os novos pilares
  const {
    periodoAtual,
    ppmContext,
    contexto,
    reincidencia,
    analiseSustentacao,
    mudancaBrusca 
  } = input;

  // 1. Gera o Texto de Resumo (Com lógica completa restaurada)
  const resumoData = gerarTextoResumo(input);

  // 2. Calcula cada Pilar Separadamente
  const pilares: DiagnosticoPilares = {
    spike: calcularPilarSpike(mudancaBrusca),
    melhoria: calcularPilarMelhoria(mudancaBrusca),
    reincidencia: calcularPilarReincidencia(reincidencia, periodoAtual),
    rebote: calcularPilarRebote(analiseSustentacao),
    topOfensor: calcularPilarTopOfensor(periodoAtual, ppmContext)
  };

  // 3. Monta lista legada de insights (para compatibilidade, caso ainda use)
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
   FUNÇÕES DE CÁLCULO DE CADA PILAR (ISOLADAS)
   ====================================================== */

function calcularPilarSpike(mudancaBrusca: any): InsightCard | null {
  if (!mudancaBrusca || mudancaBrusca.delta <= 0) return null; // Só interessa PIORA aqui

  const delta = mudancaBrusca.delta;
  const txtDelta = fmtPpm(delta);
  const nome = mudancaBrusca.nome;

  if (delta > 100) {
    return {
      tipo: "CRITICO",
      titulo: "Spike Negativo (Piora)",
      descricao: `O defeito "${nome}" saltou +${txtDelta} PPM subitamente. Indica quebra de processo ou lote defeituoso.`,
      score: 90
    };
  }
  return {
    tipo: "ALERTA",
    titulo: "Oscilação de Processo",
    descricao: `O defeito "${nome}" variou +${txtDelta} PPM. Monitore para evitar escalada.`,
    score: 50
  };
}

function calcularPilarMelhoria(mudancaBrusca: any): InsightCard | null {
  if (!mudancaBrusca || mudancaBrusca.delta >= 0) return null; // Só interessa MELHORA aqui

  const delta = mudancaBrusca.delta;
  const absDelta = Math.abs(delta);
  
  // Só considera melhoria relevante se cair mais de 100 PPM
  if (absDelta > 100) {
    return {
      tipo: "MELHORIA",
      titulo: "Melhoria Significativa",
      descricao: `O defeito "${mudancaBrusca.nome}" reduziu ${fmtPpm(absDelta)} PPM. Padronize a ação realizada.`,
      score: 80
    };
  }
  return null;
}

function calcularPilarReincidencia(reincidencia: any, periodoAtual: any): InsightCard | null {
  if (!reincidencia) return null;

  if (reincidencia.isReincidente) {
    return {
      tipo: "CRITICO",
      titulo: "Reincidência Sistêmica",
      descricao: `O grupo "${periodoAtual.principalCausa.nome}" lidera o ranking por ${reincidencia.periodosConsecutivos} períodos consecutivos.`,
      score: 100
    };
  }
  
  if (reincidencia.principalCausaAnterior === periodoAtual.principalCausa.nome) {
    return {
      tipo: "ALERTA",
      titulo: "Repetição de Ofensor",
      descricao: `O grupo "${periodoAtual.principalCausa.nome}" repetiu a liderança. Risco de se tornar crônico.`,
      score: 60
    };
  }
  return null;
}

function calcularPilarRebote(analiseSustentacao: any): InsightCard | null {
  if (!analiseSustentacao) return null;

  const { nome, ppmT, ppmT1, labelT1 } = analiseSustentacao;
  const nomePeriodoAnterior = labelT1 || "T-1";

  return {
    tipo: "ALERTA",
    titulo: "Efeito Rebote",
    descricao: `"${nome}" caiu em ${nomePeriodoAnterior} (${fmtPpm(ppmT1)} PPM) mas voltou a subir agora (${fmtPpm(ppmT)} PPM).`,
    score: 75
  };
}

function calcularPilarTopOfensor(periodoAtual: any, ppmContext: any): InsightCard | null {
  // ✅ ATUALIZAÇÃO: Retorna null para não exibir o card duplicado
  // O conteúdo já está no Resumo Executivo.
  return null;

  /* LÓGICA ANTIGA (DESATIVADA):
  if (ppmContext.producaoAtual === 0 || ppmContext.atual === 0) return null;

  return {
    tipo: "ALERTA", 
    titulo: "Atenção Imediata",
    descricao: `O ofensor **${periodoAtual.principalCausa.nome}** concentra **${fmt(periodoAtual.principalCausa.ocorrencias)}** falhas.`,
    score: 10 
  };
  */
}

/* ======================================================
   GERADOR DE TEXTO (RESTAURADO COM LÓGICA COMPLETA)
   ====================================================== */
function gerarTextoResumo(input: DiagnosticoAiInput) {
  const { periodoAtual, ppmContext } = input;
  const resumoLines: string[] = [];
  const indicadores: string[] = [];

  // 1. Check de Segurança
  if (ppmContext.producaoAtual === 0) {
    return {
      titulo: "Sem Produção Registrada",
      resumoGeral: `Não identificamos apontamentos de produção para o período (Semana ${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}). Selecione outro período.`,
      tendencia: "indefinido" as const,
      variacaoPercentual: 0,
      indicadoresChave: []
    };
  }

  // 2. Lógica de Tendência
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

  // 3. Montagem do Texto - Parágrafo 1: Contexto
  resumoLines.push(
    `No período analisado (semanas **${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}**), ` +
      `o agrupamento **${periodoAtual.principalCausa.nome}** foi o principal ofensor, ` +
      `concentrando **${fmt(periodoAtual.principalCausa.ocorrencias)}** ocorrências.`
  );

  // 4. Montagem do Texto - Parágrafo 2: Análise de Tendência
  if (tendencia !== "indefinido") {
    const sinal = diferencaPpmAbsoluta > 0 ? "+" : "";
    const txtPercent = `${sinal}${variacaoPpmPercent.toFixed(1)}%`;
    const txtAbsoluto = `${sinal}${fmtPpm(diferencaPpmAbsoluta)}`;
    const ppmAtualStr = fmtPpm(ppmContext.atual);
    const ppmAntStr = fmtPpm(ppmContext.anterior);

    if (tendencia === "melhora") {
      resumoLines.push(
        `**Cenário Positivo:** Redução de **${txtAbsoluto} PPM** (${txtPercent}) comparado ao período anterior ` +
        `(${ppmAntStr} ➝ ${ppmAtualStr}). As ações de contenção demonstram efetividade.`
      );
    } else if (tendencia === "piora") {
      resumoLines.push(
        `**Atenção (Degradação):** O processo oscilou negativamente, com aumento de **${txtAbsoluto} PPM** (${txtPercent}) ` +
        `(${ppmAntStr} ➝ ${ppmAtualStr}). Verifique as mudanças recentes no 4M.`
      );
    } else {
      resumoLines.push(
        `**Estabilidade:** O PPM variou apenas **${txtAbsoluto} PPM** (${txtPercent}), mantendo-se no patamar de ${ppmAtualStr}. ` +
        `O processo está estável, mas exige novas ações para melhoria de nível.`
      );
    }
  }

  // 5. Montagem do Texto - Parágrafo 3: Defeito Específico (Ishikawa)
  if (periodoAtual.principalDefeito.nome) {
    resumoLines.push(
      `O defeito específico **${periodoAtual.principalDefeito.nome}** liderou os registros. ` +
      `Foque o Ishikawa prioritariamente neste item.`
    );
  }

  // 6. Indicadores
  indicadores.push(`PPM: ${fmtPpm(ppmContext.atual)}`);
  
  // Título Dinâmico
  const titulos = {
      melhora: "Evolução Positiva de Qualidade",
      piora: "Alerta de Degradação",
      estavel: "Estabilidade de Processo",
      indefinido: "Diagnóstico Inicial"
  };

  return {
    titulo: titulos[tendencia] || "Diagnóstico do SIGMA-Q AI",
    resumoGeral: resumoLines.join("\n\n"),
    tendencia,
    variacaoPercentual: variacaoPpmPercent,
    indicadoresChave: indicadores
  };
}