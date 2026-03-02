"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  Tag, 
  CalendarClock, 
  ChevronRight, 
  FileCode, 
  FileSpreadsheet, 
  ArrowRight 
} from "lucide-react";

import DefectDetailsDrawer from "../../../diagnostico/components/DefectDetailsDrawer";
import "./AuditoriaNaoClassificados-glass.css";

interface AuditoriaItem {
  analise: string;
  motivo: "NAO_MAPEADO" | "SEM_AGRUPAMENTO"; 
  ocorrencias: number;
  modelosAfetados: string[];
  ultimaOcorrencia: string | null;
}

export default function AuditoriaNaoClassificados({ fonte = "todas" }: { fonte?: string }) {

  const [dados, setDados] = useState<{ 
    lista: AuditoriaItem[], 
    totalOcorrenciasNaoClassificadas: number 
  }>({
    lista: [],
    totalOcorrenciasNaoClassificadas: 0
  });
  
  const [loading, setLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerRows, setDrawerRows] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/validacao/auditoria-defeitos?fonte=${encodeURIComponent(fonte)}`);
        if (res.ok) {
          const json = await res.json();
          setDados(json.auditoria || { lista: [], totalOcorrenciasNaoClassificadas: 0 });
        }
      } catch (err) {
        console.error("Erro ao buscar dados de auditoria:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fonte]);

  const handleRowClick = async (item: AuditoriaItem) => {
    setIsDrawerOpen(true);
    setDrawerTitle(`Auditoria FMEA | Análise: ${item.analise}`);
    setDrawerLoading(true);
    setDrawerRows([]);

    try {
      const res = await fetch(`/api/validacao/auditoria-detalhes?analise=${encodeURIComponent(item.analise)}&fonte=${encodeURIComponent(fonte)}`);
      if (res.ok) {
        const json = await res.json();
        setDrawerRows(json.rows || []);
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes da auditoria:", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!dados.lista || dados.lista.length === 0) {
    return null;
  }

  return (
    <>
      <DefectDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerTitle}
        loading={drawerLoading}
        rows={drawerRows}
      />

      <section className="audit-card fade-in">

        <div className="audit-header">
          <div className="audit-icon-wrapper">
            <AlertTriangle color="#f87171" size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="audit-title">
                AUDITORIA FMEA: {fonte === "todas" ? "VISÃO GERAL" : fonte.toUpperCase()}
              </h3>

              <div className="audit-badge">
                Impacto Local: {dados.totalOcorrenciasNaoClassificadas} Peças
              </div>
            </div>

            <p className="audit-subtitle">
              Rastreamento de falhas sem classificação para <b>{fonte.toUpperCase()}</b>.
            </p>
          </div>
        </div>

        <div className="audit-body">

          <div className="audit-table-header">
            <span>Descrição & Ação de Correção</span>
            <span style={{ textAlign: "center" }}>Volume</span>
            <span>Modelos Afetados</span>
            <span style={{ textAlign: "right" }}>Último Registro</span>
          </div>

          {dados.lista.map((item, idx) => (
            <div
              key={idx}
              className="audit-row"
              onClick={() => handleRowClick(item)}
            >
              {/* 1. DESCRIÇÃO E AÇÃO */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} color="#3b82f6" strokeWidth={3} />
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                    {item.analise}
                  </span>
                </div>

                {/* 🔥 INSTRUÇÕES DE CORREÇÃO RESTAURADAS AQUI */}
                <div style={{ marginLeft: 22, marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {item.motivo === "NAO_MAPEADO" ? (
                    <>
                      <div style={{ 
                        display: "flex", alignItems: "center", gap: 6, width: "fit-content",
                        background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5", padding: "3px 8px", borderRadius: 5, 
                        textTransform: "uppercase", fontSize: "0.65rem", fontWeight: 700, border: "1px solid rgba(239, 68, 68, 0.2)"
                      }}>
                        <FileCode size={12} />
                        <span>Código Não Rastreado</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#f87171", opacity: 0.8 }}>
                        <ArrowRight size={12} />
                        <span>Adicionar em <span style={{ color: "#fff", fontWeight: 500 }}>sigmaTranslations.ts</span></span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ 
                        display: "flex", alignItems: "center", gap: 6, width: "fit-content",
                        background: "rgba(245, 158, 11, 0.1)", color: "#fcd34d", padding: "3px 8px", borderRadius: 5, 
                        textTransform: "uppercase", fontSize: "0.65rem", fontWeight: 700, border: "1px solid rgba(245, 158, 11, 0.2)"
                      }}>
                        <FileSpreadsheet size={12} />
                        <span>Sem Agrupamento FMEA</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#fbbf24", opacity: 0.8 }}>
                        <ArrowRight size={12} />
                        <span>Vincular em <span style={{ color: "#fff", fontWeight: 500 }}>agrupamento_analise.xlsx</span></span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 2. VOLUME */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="audit-volume-badge">
                  {item.ocorrencias}
                </div>
              </div>

              {/* 3. MODELOS AFETADOS */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Tag size={13} color="#475569" />
                {item.modelosAfetados.slice(0, 2).map(mod => (
                  <span key={mod} className="audit-model-tag">
                    {mod.length > 14 ? mod.substring(0, 14) + '...' : mod}
                  </span>
                ))}
                {/* Restaurado também o contador de modelos extras */}
                {item.modelosAfetados.length > 2 && (
                  <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700 }}>
                      +{item.modelosAfetados.length - 2}
                  </span>
                )}
              </div>

              {/* 4. ÚLTIMO REGISTRO */}
              <div style={{ textAlign: "right", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, fontSize: "0.8rem", fontWeight: 500 }}>
                <CalendarClock size={15} opacity={0.6} />
                {item.ultimaOcorrencia ? new Date(item.ultimaOcorrencia).toLocaleDateString("pt-BR") : "--"}
              </div>
            </div>
          ))}

        </div>

      </section>
    </>
  );
}