"use client";

import React, { useEffect, useState } from "react";
// ✅ Ícones profissionais para substituir emojis e manter consistência premium
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

interface AuditoriaItem {
  analise: string;
  motivo: "NAO_MAPEADO" | "SEM_AGRUPAMENTO"; 
  ocorrencias: number;
  modelosAfetados: string[];
  ultimaOcorrencia: string | null;
}

// ✅ Recebe a prop 'fonte' para filtrar conforme a seleção da sidebar
export default function AuditoriaNaoClassificados({ fonte = "todas" }: { fonte?: string }) {
  // ✅ Estado tipado para o novo formato de objeto da API
  const [dados, setDados] = useState<{ 
    lista: AuditoriaItem[], 
    totalOcorrenciasNaoClassificadas: number 
  }>({
    lista: [],
    totalOcorrenciasNaoClassificadas: 0
  });
  
  const [loading, setLoading] = useState(true);

  // ESTADOS DO DRAWER (GAVETA LATERAL)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerRows, setDrawerRows] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  // ✅ Regra do React: Array de dependências deve ser constante. Usamos [fonte] diretamente.
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // ✅ Busca os dados enviando a 'fonte' como parâmetro de filtro na URL
        const res = await fetch(`/api/validacao/auditoria-defeitos?fonte=${encodeURIComponent(fonte)}`);
        if (res.ok) {
          const json = await res.json();
          // ✅ Acessando a propriedade 'auditoria' do retorno da API
          setDados(json.auditoria || { lista: [], totalOcorrenciasNaoClassificadas: 0 });
        }
      } catch (err) {
        console.error("Erro ao buscar dados de auditoria:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fonte]); // ✅ Recarrega automaticamente quando o filtro da sidebar muda

  const handleRowClick = async (item: AuditoriaItem) => {
    setIsDrawerOpen(true);
    setDrawerTitle(`Auditoria FMEA | Análise: ${item.analise}`);
    setDrawerLoading(true);
    setDrawerRows([]); 

    try {
      // ✅ Busca detalhes filtrados também pela fonte
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
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: 16, marginTop: 32 }}>
        <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#ef4444", borderRadius: "50%", margin: "0 auto 12px" }} />
        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Sincronizando Auditoria com {fonte.toUpperCase()}...</span>
        <style jsx>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ✅ Verificação de segurança na lista dentro do objeto
  if (!dados.lista || dados.lista.length === 0) {
    return null; 
  }

  return (
    <>
      {/* GAVETA LATERAL DE DETALHES SQL */}
      <DefectDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerTitle}
        loading={drawerLoading}
        rows={drawerRows}
      />

      <section 
        style={{
          marginTop: 32,
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: 16,
          overflow: "hidden"
        }}
        className="fade-in"
      >
        {/* HEADER DO PAINEL COM GRADIENTE SUTIL */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(to right, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.01))",
          borderBottom: "1px solid rgba(239, 68, 68, 0.12)",
          display: "flex", alignItems: "flex-start", gap: 16
        }}>
          <div style={{ 
              background: "rgba(239, 68, 68, 0.12)", 
              padding: 10, 
              borderRadius: 12, 
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
              <AlertTriangle color="#f87171" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#fca5a5", fontWeight: 600, letterSpacing: 0.5 }}>
                  AUDITORIA FMEA: {fonte === "todas" ? "VISÃO GERAL" : fonte.toUpperCase()}
                </h3>
                {/* Badge de Impacto Local */}
                <div style={{ 
                  fontSize: "0.7rem", color: "#f87171", background: "rgba(239, 68, 68, 0.08)", 
                  padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(239, 68, 68, 0.2)",
                  fontWeight: 600, textTransform: "uppercase"
                }}>
                   Impacto Local: <span style={{ color: "#fff", marginLeft: 4 }}>{dados.totalOcorrenciasNaoClassificadas} Peças</span>
                </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, marginTop: 8, maxWidth: "750px" }}>
              Rastreamento de falhas sem classificação para <b>{fonte.toUpperCase()}</b>. Estas peças estão reduzindo a precisão global da IA nesta categoria.
            </p>
          </div>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* HEADER DA TABELA (GRID ALINHADO) */}
          <div style={{ 
              display: "grid", gridTemplateColumns: "2.5fr 1fr 2fr 1fr", gap: 20, padding: "0 20px", 
              fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 1.2, color: "#475569", fontWeight: 800 
          }}>
              <span>Descrição & Ação de Correção</span>
              <span style={{ textAlign: "center" }}>Volume</span>
              <span>Modelos Afetados</span>
              <span style={{ textAlign: "right" }}>Último Registro</span>
          </div>

          {/* LISTAGEM DE ITENS ÓRFÃOS - FILTRADOS */}
          {dados.lista.map((item, idx) => (
            <div key={idx} style={{
              display: "grid", gridTemplateColumns: "2.5fr 1fr 2fr 1fr", gap: 20, alignItems: "center",
              padding: "16px 20px", 
              background: "rgba(255,255,255,0.01)", 
              borderRadius: 14, 
              border: "1px solid rgba(255,255,255,0.03)",
              transition: "all 0.2s ease",
              cursor: "pointer"
            }}
            onClick={() => handleRowClick(item)}
            onMouseEnter={(e) => { 
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.04)"; 
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.15)"; 
            }}
            onMouseLeave={(e) => { 
                e.currentTarget.style.background = "rgba(255,255,255,0.01)"; 
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)"; 
            }}
            >
              {/* 1. DESCRIÇÃO E AÇÃO */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ChevronRight size={14} color="#3b82f6" strokeWidth={3} />
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.95rem" }}>
                          {item.analise}
                      </span>
                  </div>
                  
                  <div style={{ marginLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
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
              
              {/* 2. VOLUME (QUANTIDADE) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ 
                      background: "rgba(255, 255, 255, 0.03)", color: "#f59e0b", padding: "6px 14px", borderRadius: 20, 
                      fontWeight: 800, fontSize: "0.9rem", border: "1px solid rgba(255, 255, 255, 0.05)", minWidth: "50px", textAlign: "center"
                  }}>
                      {item.ocorrencias}
                  </div>
              </div>
              
              {/* 3. MODELOS AFETADOS */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <Tag size={13} color="#475569" style={{ marginRight: 4 }} />
                  {item.modelosAfetados.slice(0, 2).map(mod => (
                      <span key={mod} style={{ 
                          background: "rgba(255,255,255,0.03)", color: "#94a3b8", padding: "3px 8px", borderRadius: 6, 
                          fontSize: "0.7rem", border: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap"
                      }}>
                          {mod.length > 14 ? mod.substring(0, 14) + '...' : mod}
                      </span>
                  ))}
                  {item.modelosAfetados.length > 2 && (
                      <span style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700 }}>
                          +{item.modelosAfetados.length - 2}
                      </span>
                  )}
              </div>
              
              {/* 4. ÚLTIMA DATA */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "#64748b", fontSize: "0.8rem", fontWeight: 500 }}>
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