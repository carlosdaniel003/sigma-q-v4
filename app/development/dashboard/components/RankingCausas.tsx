"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell
} from "recharts";
import { CauseItem } from "../hooks/useDashboard";
import { 
  BarChart2, 
  Search, 
  FileWarning, 
  Trophy, 
  Activity, 
  AlertCircle 
} from "lucide-react";

interface Props {
  data: {
    byAnalysis: CauseItem[];
    byFailure: CauseItem[];
  };
}

// ✅ 1 & 2. Renomeação e Reordenação Lógica
// Agora trabalhamos com "sintoma" (falha) e "causa" (analise)
type RankingMode = "sintoma" | "causa";

export default function RankingCausas({ data }: Props) {
  // ✅ Padrão agora é "sintoma" (Falha)
  const [mode, setMode] = useState<RankingMode>("sintoma");

  const chartData = useMemo(() => {
    if (!data) return [];
    // Mapeamento: "causa" busca dados de Análise, "sintoma" busca dados de Falha
    if (mode === "causa") return data.byAnalysis || [];
    if (mode === "sintoma") return data.byFailure || [];
    return [];
  }, [data, mode]);

  if (chartData.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerWrapper}>
            <Tabs mode={mode} setMode={setMode} />
        </div>
        <div style={emptyState}>Sem dados para esta visão no período.</div>
      </div>
    );
  }

  const maxVal = Math.max(...chartData.map(d => d.ppm), 1);

  return (
    <div style={containerStyle}>
      <div style={headerWrapper}>
        <div style={{ marginBottom: 12 }}>
          {/* ✅ 3. SVG no Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BarChart2 size={18} color="#60A5FA" />
            <h2 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
              Ranking de Ofensores
            </h2>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0, paddingLeft: 26 }}>
            Principais sintomas e causas raiz
          </p>
        </div>
        
        {/* Botões de Seleção de Visão */}
        <Tabs mode={mode} setMode={setMode} />
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 65, left: 10, bottom: 5 }} // Aumentei a margem direita para caber " PPM"
            barCategoryGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            
            <XAxis type="number" hide domain={[0, maxVal * 1.15]} />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={130} 
              tick={{ fill: "#cbd5e1", fontSize: 10 }}
              interval={0}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.length > 20 ? val.substring(0, 18) + "..." : val}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={<CustomTooltip mode={mode} />}
            />

            <Bar dataKey="ppm" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index < 3 ? "#EF4444" : "#3B82F6"} />
              ))}
              <LabelList dataKey="ppm" content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ======================================================
   SUB-COMPONENTES AUXILIARES
====================================================== */

function Tabs({ mode, setMode }: { mode: RankingMode, setMode: (m: RankingMode) => void }) {
    return (
        <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 8 }}>
            {/* ✅ Ordem Invertida: Sintoma Primeiro */}
            <TabBtn active={mode === "sintoma"} label="Sintoma" onClick={() => setMode("sintoma")} />
            <TabBtn active={mode === "causa"} label="Causa" onClick={() => setMode("causa")} />
        </div>
    );
}

function TabBtn({ active, label, onClick }: any) {
    return (
        <button onClick={onClick} style={{
            padding: "4px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
            background: active ? "#3B82F6" : "transparent",
            color: active ? "#fff" : "#94a3b8"
        }}>{label}</button>
    );
}

const CustomTooltip = ({ active, payload, mode }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload as CauseItem;
    const formatPercent = (v: any) => v ? `(${Math.round(v * 100)}%)` : "";

    return (
        <div style={{ 
            background: "#0f172a", 
            border: "1px solid rgba(255,255,255,0.15)", 
            padding: "12px", 
            borderRadius: "8px", 
            fontSize: "11px", 
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
            minWidth: 220
        }}>
            <p style={{ fontWeight: "bold", color: "#fff", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
                {d.name}
            </p>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: "#3B82F6", display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={12} /> 
                    {/* ✅ Formatação no Tooltip */}
                    PPM: <strong>{d.ppm.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
                </span>
                <span style={{ color: "#cbd5e1", display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> Qtd: <strong>{d.defects}</strong>
                </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 8 }}>
                {d.topModel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Trophy size={12} color="#F59E0B" /> 
                        <span style={{color: "#94a3b8"}}>Modelo:</span> {d.topModel.name} {formatPercent(d.topModel.percent)}
                    </div>
                )}
                
                {/* Lógica Inversa: Se estou vendo Causa, mostro qual o Sintoma principal associado */}
                {mode !== "causa" && d.topAnalysis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Search size={12} color="#8B5CF6" />
                        <span style={{color: "#94a3b8"}}>Causa Princ.:</span> {d.topAnalysis.name} {formatPercent(d.topAnalysis.percent)}
                    </div>
                )}
                
                {/* Se estou vendo Sintoma, mostro qual a Causa principal associada */}
                {mode !== "sintoma" && d.topFailure && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileWarning size={12} color="#EC4899" />
                        <span style={{color: "#94a3b8"}}>Sintoma Princ.:</span> {d.topFailure.name} {formatPercent(d.topFailure.percent)}
                    </div>
                )}
            </div>
        </div>
    );
};

const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
        <text x={x + width + 5} y={y + height / 2 + 1} fill="#cbd5e1" textAnchor="start" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: "bold" }}>
            {/* ✅ Formatação na Barra + Texto PPM */}
            {value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PPM
        </text>
    );
};

/* ======================================================
   ESTILOS
====================================================== */
const containerStyle: React.CSSProperties = { 
    background: "rgba(255,255,255,0.04)", 
    border: "1px solid rgba(255,255,255,0.08)", 
    borderRadius: 16, 
    padding: 24, 
    height: 480, 
    display: "flex", 
    flexDirection: "column" 
};

const headerWrapper: React.CSSProperties = { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: 16 
};

const emptyState: React.CSSProperties = { 
    flex: 1, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    color: "#94a3b8" 
};