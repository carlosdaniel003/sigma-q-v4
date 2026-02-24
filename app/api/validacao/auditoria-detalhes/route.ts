// app/api/validacao/auditoria-detalhes/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadDefeitos } from "@/core/data/loadDefeitos";
import { norm } from "@/core/diagnostico/diagnosticoUtils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const analiseAlvo = norm(searchParams.get("analise"));

    if (!analiseAlvo) {
      return NextResponse.json({ error: "Parâmetro 'analise' é obrigatório." }, { status: 400 });
    }

    // 1. Carrega todos os dados do banco (mesma base que a auditoria usou)
    const defeitosRaw = await loadDefeitos();

    // 2. Filtra exatamente as linhas que caíram na malha fina como "Não Classificados"
    const detalhes = defeitosRaw.filter(d => norm(d.ANALISE) === analiseAlvo);

    // 3. Mapeia as colunas exatamente para o formato que a Gaveta (DefectDetailsDrawer) exige
    const rows = detalhes.map((d: any, idx: number) => ({
      id: d.ID || d.id || idx,
      data: d.DATA instanceof Date ? d.DATA.toLocaleDateString('pt-BR') : new Date(d.DATA).toLocaleDateString('pt-BR'),
      
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
    console.error("❌ Erro ao buscar detalhes de auditoria:", err);
    return NextResponse.json({ error: "Erro interno", details: err?.message }, { status: 500 });
  }
}