import { parseDateSafe } from "@/core/ppm/ppmDateUtils";
import { norm } from "./diagnosticoUtils";
import { DefeitoRaw } from "@/core/data/loadDefeitos";

/* ======================================================
   TIPOS
====================================================== */
export interface DiagnosticoFiltros {
  periodo: {
    semanas: { semana: number; ano: number }[];
  };
  modelo?: string[];
  categoria?: string[];
  responsabilidade?: string[];
  turno?: string[];
}

export interface DefeitoFiltrado {
  DATA: Date;
  SEMANA: number;
  ANO: number;
  MODELO: string;
  CATEGORIA: string;
  RESPONSABILIDADE: string;
  TURNO: string;
  ANALISE: string;
  CODIGO_FALHA: string;
  DESCRICAO_FALHA: string;
  QUANTIDADE: number;
  REFERENCIA_POSICAO_MECANICA?: string;
  
  // ✅ CAMPOS DE AUDITORIA (DRILL-DOWN)
  ID?: string | number;
  HORA?: string;
  TECNICO?: string;
  OBSERVACAO?: string;
  CODIGO_MOTIVO?: string;
  COMPONENTE?: string;
  SINTOMA?: string; 
  CAUSA_BRUTA?: string;
  LINHA?: string;
  
  // ✅ NOVOS: Textos originais para exibição amigável na gaveta
  MODELO_ORIGINAL?: string;
  POSICAO_ORIGINAL?: string;
}

/* ======================================================
   UTIL — SEMANA ISO
====================================================== */
function getSemanaAno(date: Date): { semana: number; ano: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { semana, ano: d.getUTCFullYear() };
}

/* ======================================================
   MOTOR DE FILTRO
====================================================== */
export function filtrarDefeitosDiagnostico(
  defeitosRaw: DefeitoRaw[],
  filtros: DiagnosticoFiltros,
  ocorrenciasIgnorar: Set<string>
): DefeitoFiltrado[] {
  console.log("\n========================================");
  console.log("🟦 [AUDITORIA] FILTRANDO BASE DE DADOS...");
  console.log(`   - Base Total: ${defeitosRaw.length} linhas`);

  if (!filtros.periodo?.semanas || filtros.periodo.semanas.length < 2) {
    return [];
  }

  const inicio = filtros.periodo.semanas[0];
  const fim = filtros.periodo.semanas[1];
  
  const valorInicio = inicio.ano * 100 + inicio.semana;
  const valorFim = fim.ano * 100 + fim.semana;

  console.log(`   - Período Alvo: ${valorInicio} até ${valorFim}`);
  
  const filtrados: DefeitoFiltrado[] = [];
  
  let excluidosOcorrencia = 0;
  let excluidosResponsabilidade = 0;
  let excluidosData = 0;
  let excluidosPeriodo = 0;
  let excluidosFiltro = 0;

  for (const r of defeitosRaw) {
    const codigoFornecedor = norm(r["CÓDIGO DO FORNECEDOR"] || r.CODIGO_MOTIVO);
    if (codigoFornecedor && ocorrenciasIgnorar.has(codigoFornecedor)) {
      excluidosOcorrencia++;
      continue;
    }

    const respCheck = norm(r.RESPONSABILIDADE);
    if (respCheck === "NAO MOSTRAR NO INDICE" || respCheck.includes("NAO MOSTRAR")) {
        excluidosResponsabilidade++;
        continue;
    }

    const date = parseDateSafe(r.DATA);
    if (!date) {
      excluidosData++;
      continue;
    }

    const { semana, ano } = getSemanaAno(date);
    const valorRegistro = ano * 100 + semana;

    if (valorRegistro < valorInicio || valorRegistro > valorFim) {
      excluidosPeriodo++;
      continue;
    }

    let passou = true;

    if (filtros.modelo?.length && !filtros.modelo.includes(norm(r.MODELO))) passou = false;
    if (filtros.categoria?.length && !filtros.categoria.includes(norm(r.CATEGORIA))) passou = false;
    if (filtros.responsabilidade?.length && !filtros.responsabilidade.includes(norm(r.RESPONSABILIDADE))) passou = false;
    if (filtros.turno?.length && !filtros.turno.includes(norm(r.TURNO))) passou = false;

    if (!passou) {
      excluidosFiltro++;
      continue;
    }

    const rawAnalise = r["ANÁLISE"] || r.ANALISE;
    const nomeDoComponente = (r as any)["PEÇA/PLACA"] || r.COMPONENTE || "Não informado";
    const nomeDoSintoma = (r as any)["DESCRIÇÃO DA FALHA"] || (r as any)["DESCRIÇÃO DA FALHA"] || r["DESCRIÇÃO DA FALHA"] || "Não informado";
    const posMecanicaOriginal = r["REFERÊNCIA/POSIÇÃO MECÂNICA"] || r.POSICAO_MECANICA || "Não informada";

    filtrados.push({
      // Campos originais para o painel de contagem (Normalizados)
      DATA: date,
      SEMANA: semana,
      ANO: ano,
      MODELO: norm(r.MODELO),
      CATEGORIA: norm(r.CATEGORIA),
      RESPONSABILIDADE: norm(r.RESPONSABILIDADE),
      TURNO: norm(r.TURNO),
      ANALISE: norm(rawAnalise),
      CODIGO_FALHA: norm(r["CÓDIGO DA FALHA"] || (r as any).CODIGO_FALHA),
      DESCRICAO_FALHA: norm(nomeDoSintoma),
      QUANTIDADE: Number(r.QUANTIDADE) || 0,
      REFERENCIA_POSICAO_MECANICA: posMecanicaOriginal, // Será norm() no route.ts se precisar

      // DADOS PARA A GAVETA (Passando limpo, com formatação original preservada)
      ID: r.ID,
      HORA: r.HORA,
      TECNICO: r.TÉCNICO || (r as any).TECNICO,
      OBSERVACAO: r.OBSERVACAO,
      CODIGO_MOTIVO: r.CODIGO_MOTIVO || r["CÓDIGO DO FORNECEDOR"],
      COMPONENTE: nomeDoComponente, 
      SINTOMA: nomeDoSintoma,
      CAUSA_BRUTA: (r as any).causa || r.ANALISE, 
      LINHA: (r as any).LINHA || (r as any).linha,
      
      // ✅ AQUI VÃO OS TEXTOS ORIGINAIS (Preserva espaços e pontuação)
      MODELO_ORIGINAL: r.MODELO,
      POSICAO_ORIGINAL: posMecanicaOriginal
    });
  }

  console.log("\n📊 RESUMO DO FUNIL:");
  console.log(`   ❌ Excluídos por Lista Negra (Cód. Fornecedor): ${excluidosOcorrencia}`);
  console.log(`   ❌ Excluídos por 'NÃO MOSTRAR NO INDICE': ${excluidosResponsabilidade}`);
  console.log(`   ❌ Excluídos por Data Inválida: ${excluidosData}`);
  console.log(`   ❌ Excluídos por Período: ${excluidosPeriodo}`);
  console.log(`   ❌ Excluídos por Filtros (Cat/Resp...): ${excluidosFiltro}`);
  console.log(`   ✅ ITENS RESTANTES: ${filtrados.length}`);
  console.log("========================================\n");

  return filtrados;
}