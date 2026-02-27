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
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} color="#3b82f6" strokeWidth={3} />
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                    {item.analise}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="audit-volume-badge">
                  {item.ocorrencias}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag size={13} color="#475569" />
                {item.modelosAfetados.slice(0, 2).map(mod => (
                  <span key={mod} className="audit-model-tag">
                    {mod.length > 14 ? mod.substring(0, 14) + '...' : mod}
                  </span>
                ))}
              </div>

              <div style={{ textAlign: "right", color: "#64748b" }}>
                {item.ultimaOcorrencia ? new Date(item.ultimaOcorrencia).toLocaleDateString("pt-BR") : "--"}
              </div>
            </div>
          ))}

        </div>

      </section>
    </>
  );
}