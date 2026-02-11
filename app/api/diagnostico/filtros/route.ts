import { NextResponse } from "next/server";
// ✅ O loader agora é assíncrono (busca do SQL)
import { loadDefeitos } from "@/core/data/loadDefeitos";
import { norm } from "@/core/diagnostico/diagnosticoUtils";
import { parseDateSafe } from "@/core/ppm/ppmDateUtils";

/* ======================================================
   UTIL — SEMANA ISO + MÊS
====================================================== */
function getSemanaAno(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(
    (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );

  return {
    semana,
    ano: d.getUTCFullYear(),
    mes: date.getMonth() + 1, // 1-12
  };
}

/* ======================================================
   API — FILTROS DIAGNÓSTICO IA
====================================================== */
export async function GET(req: Request) {
  try {
    // ❌ ANTES (Dava erro pois retornava uma Promessa):
    // const defeitosRaw = loadDefeitos();

    // ✅ AGORA (Corrigido com await):
    const defeitosRaw = await loadDefeitos();

    // Sets para garantir unicidade
    const semanasSet = new Set<string>();
    const mesesSet = new Set<string>(); // ✅ Novo: Meses disponíveis
    const modelos = new Set<string>();
    const categorias = new Set<string>();
    const responsabilidades = new Set<string>();
    const turnos = new Set<string>();

    const modeloCategoriaMap = new Map<string, string>();

    // Agora o forEach funciona porque defeitosRaw é o array de dados final
    defeitosRaw.forEach((r) => {
      const date = parseDateSafe(r.DATA);
      if (!date) return;

      const { semana, ano, mes } = getSemanaAno(date);

      // Adiciona Semana/Ano
      semanasSet.add(JSON.stringify({ semana, ano }));
      
      // ✅ Adiciona Mês/Ano
      mesesSet.add(JSON.stringify({ mes, ano }));

      const mod = norm(r.MODELO);
      const cat = norm(r.CATEGORIA);
      
      if (mod) modelos.add(mod);
      if (cat) categorias.add(cat);
      if (r.RESPONSABILIDADE) responsabilidades.add(norm(r.RESPONSABILIDADE));
      if (r.TURNO) turnos.add(norm(r.TURNO));

      if (mod && cat && !modeloCategoriaMap.has(mod)) {
        modeloCategoriaMap.set(mod, cat);
      }
    });

    /* ======================================================
       ORDENAÇÃO E RESPOSTA
    ====================================================== */
    const semanasOrdenadas = Array.from(semanasSet)
      .map((s) => JSON.parse(s))
      .sort((a, b) => b.ano - a.ano || b.semana - a.semana);

    // ✅ Ordena meses (mais recente primeiro)
    const mesesOrdenados = Array.from(mesesSet)
      .map((m) => JSON.parse(m))
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes);

    return NextResponse.json({
      semanas: semanasOrdenadas,
      meses: mesesOrdenados, // ✅ Retorna para o front
      modelos: [...modelos].sort(),
      categorias: [...categorias].sort(),
      responsabilidades: [...responsabilidades].sort(),
      turnos: [...turnos].sort(),
      modeloCategoriaMap: Object.fromEntries(modeloCategoriaMap),
    });
  } catch (err: any) {
    console.error("❌ Erro ao carregar filtros diagnóstico:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err?.message },
      { status: 500 }
    );
  }
}