"use client";

import { useState, useMemo } from "react";
import "./ppm.css";
import { usePpmValidation } from "./hooks/usePpmValidation";

import PpmSidebar from "./components/PpmSidebar";
import PpmKpis from "./components/PpmKpis";
import PpmCategoriasStatus from "./components/PpmCategoriasStatus";
import PpmDiagnosticoInteligente from "./components/PpmDiagnosticoInteligente";
import PpmTabelaDetalhada from "./components/PpmTabelaDetalhada";
import PpmOcorrenciasBreakdown from "./components/PpmOcorrenciasBreakdown";
import PpmOcorrenciasModal from "./components/PpmOcorrenciasModal";

/* ======================================================
   TIPOS
====================================================== */
type DiagnosticoReason =
  | "OK"
  | "DADOS_INCOMPLETOS"
  | "SEM_PRODUCAO"
  | "PPM_ZERADO";

/* ======================================================
   HELPER DE NORMALIZAÇÃO (Igual ao Breakdown)
====================================================== */
function normalizeForMatch(val: string) {
    return String(val || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "") // Remove espaços e traços: "INT MOD" -> "INTMOD"
        .trim();
}

/* ======================================================
   MAPA CANÔNICO REVERSO (Opcional, para garantir)
   Se o breakdown exibe "INT MOD" (com espaço), precisamos garantir
   que a busca entenda isso.
====================================================== */
const MAPA_CANONICO_FRONT: Record<string, string> = {
    // Se o breakdown manda "INT MOD", normalizamos para "INTMOD"
    // Isso garante que se o clique vier limpo ou sujo, funciona.
};

export default function PpmPage() {
  const { data, error } = usePpmValidation();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  // ✅ ESTADOS PARA O MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  /* ======================================================
      BASE GLOBAL
   ====================================================== */
  const allRows = useMemo(() => data?.allRows ?? [], [data]);

  /* ======================================================
      BASE FILTRADA POR CATEGORIA
   ====================================================== */
  const rowsBase = useMemo(() => {
    return categoriaAtiva
      ? allRows.filter((r) => r.categoria === categoriaAtiva)
      : allRows;
  }, [allRows, categoriaAtiva]);

  /* ======================================================
      PRECISÃO GLOBAL
   ====================================================== */
  const precisaoGlobal = useMemo(() => {
    const total = allRows.length;
    if (total === 0) return 0;

    const validos = allRows.filter(
      (r) => r.validationStatus === "VALID"
    ).length;

    return Math.round((validos / total) * 100);
  }, [allRows]);

  /* ======================================================
      OCORRÊNCIAS — FONTE DINÂMICA
   ====================================================== */
  const ocorrenciasBreakdown = useMemo(() => {
    if (categoriaAtiva && data?.meta?.occurrencesByCategory?.[categoriaAtiva]) {
      return data.meta.occurrencesByCategory[categoriaAtiva] as unknown as Record<string, number>;
    }
    if (data?.meta?.occurrencesByCode) {
        return data.meta.occurrencesByCode as unknown as Record<string, number>;
    }
    return {};
  }, [data, categoriaAtiva]);

  // ✅ LOGICA DE FILTRO PARA O MODAL (DRILL-DOWN) COM DEBUG
  const modalItems = useMemo(() => {
      // Type Cast para acessar a lista bruta
      const metaAny = data?.meta as any;
      const rawList = metaAny?.occurrencesList as any[];

      if (!selectedCode || !rawList) return [];
      
      // Normaliza o código selecionado (ex: "AC" ou "AC " vira "AC")
      const alvo = normalizeForMatch(selectedCode);

      console.log(`🔍 [MODAL FILTER] Buscando por: "${selectedCode}" -> Normalizado: "${alvo}"`);
      console.log(`🔍 [MODAL FILTER] Total na lista bruta: ${rawList.length}`);

      const filtered = rawList.filter(item => {
          // 1. Pega o código do item (ex: "AC", "A C", "ac")
          const itemCodeRaw = String(item["CÓDIGO DO FORNECEDOR"] || "").toUpperCase();
          const itemCodeNorm = normalizeForMatch(itemCodeRaw);

          // 2. Compara normalizado
          const codeMatch = itemCodeNorm === alvo;
          
          // 3. Filtra pela Categoria Ativa (se houver)
          const catMatch = categoriaAtiva ? item.CATEGORIA === categoriaAtiva : true;

          // DEBUG ESPORÁDICO (Apenas para o primeiro item falho e sucesso)
          // if (Math.random() < 0.01) console.log(`   Item: "${itemCodeRaw}" -> Norm: "${itemCodeNorm}" == "${alvo}"? ${codeMatch}`);

          return codeMatch && catMatch;
      });

      console.log(`✅ [MODAL FILTER] Encontrados: ${filtered.length}`);
      return filtered;

  }, [data, selectedCode, categoriaAtiva]);

  /* ======================================================
      KPIs
   ====================================================== */
  const metaDinamico = useMemo(() => {
    const totalVolume = rowsBase.reduce(
      (s, r) => s + (r.produzido || 0),
      0
    );

    const totalDefeitos = rowsBase.reduce(
      (s, r) => s + (r.defeitos || 0),
      0
    );

    const ppmGeral =
      totalVolume > 0
        ? Number(
            ((totalDefeitos / totalVolume) * 1_000_000).toFixed(2)
          )
        : null;

    const validos = rowsBase.filter(
      (r) => r.validationStatus === "VALID"
    ).length;

    const aiPrecision =
      rowsBase.length > 0
        ? Math.round((validos / rowsBase.length) * 100)
        : 0;

    let ocorrencias = 0;
    if (categoriaAtiva) {
        const breakdown = data?.meta?.occurrencesByCategory?.[categoriaAtiva] as unknown as Record<string, number>;
        if (breakdown) {
             ocorrencias = Object.values(breakdown).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        }
    } else {
        ocorrencias = data?.meta?.totalOccurrences ?? 0;
    }

    return {
      totalVolume,
      totalDefeitos,
      ppmGeral,
      aiPrecision,
      itensSemProducao: rowsBase.filter(
        (r) => r.produzido === 0 && r.defeitos > 0
      ).length,
      itensSemDefeitos: rowsBase.filter(
        (r) => r.produzido > 0 && r.defeitos === 0
      ).length,
      ocorrencias,
    };
  }, [rowsBase, categoriaAtiva, data]);

  /* ======================================================
      SIDEBAR
   ====================================================== */
  const metaSidebar = useMemo(
    () => ({
      totalVolume: data?.meta?.totalProduction ?? 0,
      totalDefeitos: data?.meta?.totalDefects ?? 0,
      ppmGeral: data?.meta?.ppmGeral ?? null,
      aiPrecision: precisaoGlobal,
    }),
    [data, precisaoGlobal]
  );

  /* ======================================================
      DIAGNÓSTICO
   ====================================================== */
  const diagnosticoItems = useMemo(() => {
    return rowsBase
      .map((r) => {
        let reason: DiagnosticoReason | null = null;

        if (r.produzido === 0 && r.defeitos > 0) {
          reason = "SEM_PRODUCAO";
        } else if (r.produzido === 0 && r.defeitos === 0) {
          reason = "DADOS_INCOMPLETOS";
        } else if (r.ppm === 0 && r.defeitos > 0) {
          reason = "PPM_ZERADO";
        }

        if (!reason) return null;

        return {
          groupKey: r.groupKey,
          modelo: r.modelo,
          categoria: r.categoria,
          produzido: r.produzido,
          defeitos: r.defeitos,
          ppm: r.ppm ?? 0,
          precision:
            data?.byCategory?.[r.categoria]?.aiPrecision ?? 0,
          dataProducao: r.datasProducao?.[0],
          dataDefeito: r.datasDefeito?.[0],
          reason,
        };
      })
      .filter(Boolean) as any[];
  }, [rowsBase, data]);

  if (error) return <div className="ppm-error">{error}</div>;

  return (
    <div className="ppm-layout">
      <PpmSidebar
        byCategory={data?.byCategory ?? {}}
        meta={metaSidebar}
        categoriaAtiva={categoriaAtiva}
        onSelectCategory={setCategoriaAtiva}
      />

      <main
        className="ppm-main ppm-fade-slide"
        key={categoriaAtiva ?? "geral"}
      >
        <PpmKpis meta={metaDinamico} />

        {/* ✅ Passando handler para abrir o modal */}
        <PpmOcorrenciasBreakdown 
            data={ocorrenciasBreakdown} 
            onClickCode={(code) => {
                console.log("🖱️ Clique no Card:", code);
                setSelectedCode(code);
                setModalOpen(true);
            }}
        />

        <PpmCategoriasStatus
          byCategory={Object.fromEntries(
            Object.entries(data?.byCategory ?? {}).map(([k, v]) => [
              k,
              { precision: v.aiPrecision },
            ])
          )}
        />

        <PpmDiagnosticoInteligente items={diagnosticoItems} />
        <PpmTabelaDetalhada items={diagnosticoItems} />
      </main>

      {/* ✅ Modal de Detalhes */}
      <PpmOcorrenciasModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        code={selectedCode}
        items={modalItems}
      />
    </div>
  );
}