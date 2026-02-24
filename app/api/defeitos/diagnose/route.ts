// app/api/defeitos/diagnose/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

/* ------------------ HELPERS ------------------ */
function resolveCategoria(issues: string[]): string {
  const s = issues.join(" ").toLowerCase();

  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("falha")) return "falhas";
  if (s.includes("modelo") || s.includes("produto") || s.includes("código"))
    return "modelos";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";

  return "outros";
}

/* ------------------ CACHE ------------------ */
const DIAG_CACHE = new Map<string, { ts: number; data: any }>();
const DIAG_TTL = 1000 * 60 * 2; // 2 minutos

// =================================================
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Pega o parametro limpo, mas guarda a referência original
    let fonteParam = (url.searchParams.get("fonte") || "todas").trim();

    if (!fonteParam) fonteParam = "todas";

    // Cache key baseada no parametro
    const cacheKey = `diag_v18_sql:${fonteParam.toLowerCase()}`;

    const cached = DIAG_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < DIAG_TTL) {
      return NextResponse.json({ ok: true, cached: true, ...cached.data });
    }

    const cache = await getDefeitosCache({
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true,
    });

    // ============================================================
    // 🔎 SELEÇÃO ROBUSTA DA LISTA (Case Insensitive Match)
    // ============================================================
    let lista: any[] = [];
    const target = fonteParam.toLowerCase();

    if (target === "todas") {
        lista = cache.enriched;
    } else if (target === "sem categoria") {
        // Coleta todos os órfãos
        lista = [
            ...(cache["n/a"] || []),
            ...(cache[""] || []),
            ...(cache["null"] || []),
            ...(cache["undefined"] || [])
        ];
    } else {
        // 🧠 BUSCA INTELIGENTE DE CHAVE
        // Procura no objeto de cache qual chave real (ex: "CM", "MwO") bate com o parametro ("cm", "mwo")
        const realKey = Object.keys(cache).find(k => k.toLowerCase() === target);
        
        if (realKey) {
            lista = (cache as any)[realKey];
        } else {
            console.warn(`⚠️ [DIAGNOSE] Chave não encontrada no cache: ${fonteParam}`);
            lista = [];
        }
    }

    const problemItems = lista.filter(
      (r: any) => Array.isArray(r._issues) && r._issues.length > 0
    );

    /* --------------------------------------------------
       AGRUPAMENTO
    -------------------------------------------------- */
    const groups = new Map<string, any>();

    for (const item of problemItems) {
      const categoriaIssue = resolveCategoria(item._issues);

      const m = item.MODELO || "N/A";
      const f = item["CÓDIGO DA FALHA"] || "N/A";
      const r = item["CÓDIGO DO FORNECEDOR"] || "N/A";

      // LÓGICA DE CATEGORIA DE PRODUTO
      // Tenta normalizar para garantir que o frontend receba o nome correto
      let catProduto = String(item.CATEGORIA || item.categoria || item.fonte || "").trim();
      
      // Se for vazia/nula, joga para o balde SEM CATEGORIA
      if (!catProduto || catProduto.toLowerCase() === 'n/a' || catProduto.toLowerCase() === 'null') {
          catProduto = "SEM CATEGORIA";
      }

      // 🔒 TRAVA DE CONSISTÊNCIA VISUAL
      // Se eu pedi "CM" e o item é "CM", garanto que a string de saída seja igual à entrada
      // Isso evita que o filtro do frontend (que é case sensitive) esconda o item
      if (target !== 'todas' && target !== 'sem categoria') {
          // Se estamos numa visão filtrada, forçamos o nome da fonte para bater com o filtro
          // (Desde que não seja um erro grosseiro de categoria errada misturada)
           catProduto = fonteParam.toUpperCase(); 
      }

      const key = `${catProduto}|${categoriaIssue}|${m}|${f}|${r}`;

      if (!groups.has(key)) {
        groups.set(key, {
          fonte: catProduto, 
          categoria: categoriaIssue,
          modelo: m,
          falha: f,
          resp: r,
          issues: new Set<string>(),
          count: 0,
        });
      }

      const g = groups.get(key);
      g.count++;
      item._issues.forEach((i: string) => g.issues.add(i));
    }

    /* --------------------------------------------------
       NORMALIZAÇÃO PARA O FRONTEND
    -------------------------------------------------- */
    const diagnosisList = Array.from(groups.values()).map((g) => ({
      categoria: g.categoria,
      fonte: g.fonte,
      modelo: g.modelo,
      falha: g.falha,
      resp: g.resp,
      count: g.count,
      issues: Array.from(g.issues),
      severity: g.count > 10 ? "high" : "medium",
    }));

    diagnosisList.sort((a, b) => b.count - a.count);

    const payload = {
      items: diagnosisList.slice(0, 100),
    };

    DIAG_CACHE.set(cacheKey, { ts: Date.now(), data: payload });

    return NextResponse.json({ ok: true, ...payload });
  } catch (err: any) {
    console.error("DIAG ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}