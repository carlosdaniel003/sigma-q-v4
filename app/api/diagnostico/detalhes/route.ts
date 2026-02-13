// app/api/diagnostico/detalhes/route.ts
import { NextResponse } from "next/server";
import { loadDefeitos } from "@/core/data/loadDefeitos";
import { loadOcorrencias } from "@/core/data/loadOcorrencias";
import { filtrarDefeitosDiagnostico } from "@/core/diagnostico/diagnosticoFilterEngine";
import { norm } from "@/core/diagnostico/diagnosticoUtils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Identificação do Alvo (Clique no Drill-down)
    const modeloAlvo = norm(searchParams.get("modelo"));
    const posicaoAlvo = norm(searchParams.get("posicao"));
    const analiseAlvo = norm(searchParams.get("analise")); // A "Causa" exata clicada no Gráfico

    // 2. Parâmetros de Tempo e Contexto
    const periodoTipo = searchParams.get("periodoTipo") as "semana" | "mes";
    const periodoValor = Number(searchParams.get("periodoValor"));
    const anoRef = Number(searchParams.get("ano"));
    const turno = searchParams.get("turno");
    const categoria = searchParams.get("categoria");

    if (!modeloAlvo || !posicaoAlvo || !periodoValor || !anoRef) {
      return NextResponse.json({ error: "Parâmetros insuficientes" }, { status: 400 });
    }

    // 3. Carregamento das Bases
    const defeitosRaw = await loadDefeitos();
    const ocorrenciasIgnorar = loadOcorrencias();

    // 4. Sincronização com o Motor de Filtro Oficial
    const filtrosEngine = {
      periodo: {
        semanas: periodoTipo === "semana" 
          ? [{ semana: periodoValor, ano: anoRef }, { semana: periodoValor, ano: anoRef }]
          : [
              { semana: 1, ano: anoRef },
              { semana: 53, ano: anoRef }
            ]
      },
      modelo: [modeloAlvo],
      categoria: categoria && categoria !== "Todos" ? [norm(categoria)] : undefined,
      turno: turno && turno !== "Todos" ? [norm(turno)] : undefined
    };

    let baseFiltradaOficial = filtrarDefeitosDiagnostico(defeitosRaw, filtrosEngine, ocorrenciasIgnorar);

    // 5. Refinamento Final para o Drawer (CROSS-CHECK)
    const detalhes = baseFiltradaOficial.filter((d) => {
      // Filtro de Mês
      if (periodoTipo === "mes") {
        const mesRegistro = d.DATA.getMonth() + 1;
        if (mesRegistro !== periodoValor) return false;
      }

      // Filtro de Posição
      if (norm(d.REFERENCIA_POSICAO_MECANICA) !== posicaoAlvo) return false;

      // ✅ A MÁGICA: Filtro de Análise (Cross-check)
      // Como o gráfico agrupa por d.ANALISE, garantimos que apenas os itens 
      // que o gráfico considerou sob esse nome passem para a Gaveta.
      if (analiseAlvo) {
        const analiseDoItem = norm(d.ANALISE);
        const causaBruta = norm(d.CAUSA_BRUTA);
        const sintomaItem = norm(d.DESCRICAO_FALHA);
        
        // Verifica se a string clicada no gráfico bate com a Análise ou Sintoma do registro
        if (analiseDoItem !== analiseAlvo && causaBruta !== analiseAlvo && sintomaItem !== analiseAlvo) {
            return false; 
        }
      }

      return true;
    });

    // 6. Mapeamento para o formato do Drawer
    const rows = detalhes.map((d: any, idx: number) => ({
      id: d.ID || d.id || idx,
      data: d.DATA instanceof Date ? d.DATA.toLocaleDateString('pt-BR') : d.DATA,
      
      hora: d.HORA || d.hora_criacao || "--:--",
      tecnico: d.TECNICO || d.TÉCNICO || d.usuario || "Não informado", 
      
      modelo: d.MODELO_ORIGINAL || d.MODELO || d.modelo || "Não informado",
      posicao: d.POSICAO_ORIGINAL || d.REFERENCIA_POSICAO_MECANICA || d.POSICAO_MECANICA || d.referencia || "Não informada",
      
      motivoCod: d.CODIGO_MOTIVO || d.cod_mot || "N/A",
      motivoDesc: d.RESPONSABILIDADE || "N/A",
      
      causa: d.CAUSA_BRUTA || d.causa || d.ANALISE || "Não informada",
      observacao: d.OBSERVACAO || d.obs || "",
      
      sintoma: d.SINTOMA || d.DESCRICAO_FALHA || d.desc_falha || d.code_def || "Não informado",
      componente: d.COMPONENTE || d.desc_componente || d["PEÇA/PLACA"] || "Não informado",
      linha: d.LINHA || d.linha || "",
      
      quantidade: Number(d.QUANTIDADE) || 1
    })).sort((a: any, b: any) => b.id - a.id); 

    return NextResponse.json({ rows });

  } catch (err: any) {
    console.error("❌ Erro ao buscar detalhes SQL:", err);
    return NextResponse.json({ 
      error: "Erro interno", 
      details: err?.message || "Erro desconhecido" 
    }, { status: 500 });
  }
}