"use client";

import { useState, useMemo } from "react";
import { BarChart3, CheckCircle } from "lucide-react"; // ✅ Ícone de Sucesso Importado

import "./ppm.css";
import "./ppm-glass.css";
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
   HELPER DE NORMALIZAÇÃO
====================================================== */
function normalizeForMatch(val: string) {
  return String(val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

const MAPA_CANONICO_FRONT: Record<string, string> = {};

export default function PpmPage() {
  const { data, error } = usePpmValidation();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const allRows = useMemo(() => data?.allRows ?? [], [data]);

  const rowsBase = useMemo(() => {
    return categoriaAtiva
      ? allRows.filter((r) => r.categoria === categoriaAtiva)
      : allRows;
  }, [allRows, categoriaAtiva]);

  const precisaoGlobal = useMemo(() => {
    const total = allRows.length;
    if (total === 0) return 0;

    const validos = allRows.filter(
      (r) => r.validationStatus === "VALID"
    ).length;

    return Math.round((validos / total) * 100);
  }, [allRows]);

  const ocorrenciasBreakdown = useMemo(() => {
    if (categoriaAtiva && data?.meta?.occurrencesByCategory?.[categoriaAtiva]) {
      return data.meta.occurrencesByCategory[categoriaAtiva] as unknown as Record<string, number>;
    }
    if (data?.meta?.occurrencesByCode) {
      return data.meta.occurrencesByCode as unknown as Record<string, number>;
    }
    return {};
  }, [data, categoriaAtiva]);

  const modalItems = useMemo(() => {
    const metaAny = data?.meta as any;
    const rawList = metaAny?.occurrencesList as any[];

    if (!selectedCode || !rawList) return [];

    const alvo = normalizeForMatch(selectedCode);

    const filtered = rawList.filter(item => {
      const itemCodeRaw = String(item["CÓDIGO DO FORNECEDOR"] || "").toUpperCase();
      const itemCodeNorm = normalizeForMatch(itemCodeRaw);

      const codeMatch = itemCodeNorm === alvo;
      const catMatch = categoriaAtiva ? item.CATEGORIA === categoriaAtiva : true;

      return codeMatch && catMatch;
    });

    return filtered;
  }, [data, selectedCode, categoriaAtiva]);

  const metaDinamico = useMemo(() => {
    const totalVolume = rowsBase.reduce((s, r) => s + (r.produzido || 0), 0);
    const totalDefeitos = rowsBase.reduce((s, r) => s + (r.defeitos || 0), 0);

    const ppmGeral =
      totalVolume > 0
        ? Number(((totalDefeitos / totalVolume) * 1_000_000).toFixed(2))
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
      const breakdown =
        data?.meta?.occurrencesByCategory?.[categoriaAtiva] as unknown as Record<string, number>;
      if (breakdown) {
        ocorrencias = Object.values(breakdown).reduce(
          (acc, curr) => acc + (Number(curr) || 0),
          0
        );
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

  const metaSidebar = useMemo(
    () => ({
      totalVolume: data?.meta?.totalProduction ?? 0,
      totalDefeitos: data?.meta?.totalDefects ?? 0,
      ppmGeral: data?.meta?.ppmGeral ?? null,
      aiPrecision: precisaoGlobal,
    }),
    [data, precisaoGlobal]
  );

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

  // ✅ LOGICA DA TELA DE SUCESSO (Friendly Box)
  const isVisaoGeral = categoriaAtiva === null;
  const isCategoria100 = !isVisaoGeral && metaDinamico.aiPrecision === 100 && metaDinamico.itensSemProducao === 0;

  if (error) return <div className="ppm-error">{error}</div>;

  return (
    <div className="ppm-layout">
      <PpmSidebar
        byCategory={data?.byCategory ?? {}}
        meta={metaSidebar}
        categoriaAtiva={categoriaAtiva}
        onSelectCategory={setCategoriaAtiva}
      />

      <main className="ppm-main ppm-fade-slide" key={categoriaAtiva ?? "geral"}>
        
        {/* ================= TITLE GLASS CARD ================= */}
        <div className="ppm-title-card">
          <div className="ppm-title-header">
            <div className="ppm-title-left">
              <h1 className="ppm-title">
                <BarChart3 size={28} className="ppm-title-icon" style={{ color: '#ffffff' }} />
                Validação de PPM
              </h1>
              <span className="ppm-title-sub" style={{ marginLeft: '38px' }}>
                Cálculo e Análise de Partes Por Milhão
              </span>
            </div>

            <div className="ppm-title-meta">
              Automático • {metaDinamico.totalVolume.toLocaleString()} unidades processadas
            </div>
          </div>
        </div>

        {/* ================= TELA DE SUCESSO ================= */}
        {isCategoria100 ? (
           <section className="friendly-box fade-in" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', marginTop: '20px'
            }}>
              <div className="friendly-icon" style={{ marginBottom: '16px', color: '#22c55e' }}>
                  <CheckCircle size={56} strokeWidth={1.5} />
              </div>
              <h3 className="friendly-title" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Qualidade Máxima Atingida
              </h3>
              <p className="friendly-text" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                A categoria <strong style={{ color: 'var(--success)' }}>{categoriaAtiva}</strong> não possui
                inconsistências pendentes.
              </p>
              <p className="friendly-subtext" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                O cálculo de PPM foi gerado com 100% de confiança pelo motor SIGMA-Q.
              </p>
            </section>
        ) : (
          /* ================= CONTEÚDO NORMAL DE ANÁLISE ================= */
          <>
            <PpmKpis meta={metaDinamico} />

            <PpmOcorrenciasBreakdown
              data={ocorrenciasBreakdown}
              onClickCode={(code) => {
                setSelectedCode(code);
                setModalOpen(true);
              }}
            />

            <PpmDiagnosticoInteligente items={diagnosticoItems} />
            <PpmTabelaDetalhada items={diagnosticoItems} />
          </>
        )}
      </main>

      <PpmOcorrenciasModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        code={selectedCode}
        items={modalItems}
      />
    </div>
  );
}