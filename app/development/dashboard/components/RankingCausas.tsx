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

import "./RankingCausas-glass.css"; // ✅ NOVO CSS IMPORTADO

interface Props {
  data: {
    byAnalysis: CauseItem[];
    byFailure: CauseItem[];
  };
}

type RankingMode = "sintoma" | "causa";

export default function RankingCausas({ data }: Props) {
  const [mode, setMode] = useState<RankingMode>("sintoma");

  const chartData = useMemo(() => {
    if (!data) return [];
    if (mode === "causa") return data.byAnalysis || [];
    if (mode === "sintoma") return data.byFailure || [];
    return [];
  }, [data, mode]);

  if (chartData.length === 0) {
    return (
      <div className="ranking-chart-container">
        <div className="ranking-chart-header">
            <div className="ranking-title-wrapper">
              <h2 className="ranking-title">
                <BarChart2 size={20} color="#60A5FA" />
                Ranking de Ofensores
              </h2>
              <p className="ranking-subtitle">Principais sintomas e causas raiz</p>
            </div>
            <Tabs mode={mode} setMode={setMode} />
        </div>
        <div className="ranking-empty-state">Sem dados para esta visão no período.</div>
      </div>
    );
  }

  const maxVal = Math.max(...chartData.map(d => d.ppm), 1);

  return (
    <div className="ranking-chart-container">
      
      {/* CABEÇALHO */}
      <div className="ranking-chart-header">
        <div className="ranking-title-wrapper">
          <h2 className="ranking-title">
            <BarChart2 size={20} color="#60A5FA" />
            Ranking de Ofensores
          </h2>
          <p className="ranking-subtitle">Principais sintomas e causas raiz</p>
        </div>
        
        {/* Botões de Seleção de Visão */}
        <Tabs mode={mode} setMode={setMode} />
      </div>

      {/* ÁREA DO GRÁFICO */}
      <div className="ranking-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 65, left: 10, bottom: 5 }} 
            barCategoryGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            
            <XAxis type="number" hide domain={[0, maxVal * 1.15]} />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={130} 
              tick={{ fill: "#cbd5e1", fontSize: 11 }}
              interval={0}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.length > 20 ? val.substring(0, 18) + "..." : val}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={<CustomTooltip mode={mode} />}
            />

            <Bar dataKey="ppm" radius={[0, 6, 6, 0]} barSize={18}>
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
        <div className="ranking-tabs-container">
            <TabBtn active={mode === "sintoma"} label="Sintoma" onClick={() => setMode("sintoma")} />
            <TabBtn active={mode === "causa"} label="Causa" onClick={() => setMode("causa")} />
        </div>
    );
}

function TabBtn({ active, label, onClick }: any) {
    return (
        <button 
          onClick={onClick} 
          className={`ranking-tab-btn ${active ? "is-active" : ""}`}
        >
          {label}
        </button>
    );
}

const CustomTooltip = ({ active, payload, mode }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload as CauseItem;
    const formatPercent = (v: any) => v ? `(${Math.round(v * 100)}%)` : "";

    return (
        <div style={{ 
            background: "rgba(15, 23, 42, 0.85)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)", 
            padding: "16px", 
            borderRadius: "16px", 
            fontSize: "12px", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            minWidth: 240
        }}>
            <p style={{ fontWeight: 800, color: "#f8fafc", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                {d.name}
            </p>

            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: "#60A5FA", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} /> 
                    PPM: <strong>{d.ppm.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
                </span>
                <span style={{ color: "#cbd5e1", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> Qtd: <strong>{d.defects}</strong>
                </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 10 }}>
                {d.topModel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={14} color="#F59E0B" /> 
                        <span style={{color: "#94a3b8"}}>Modelo:</span> 
                        <span style={{color: "#f8fafc", fontWeight: 600}}>{d.topModel.name} {formatPercent(d.topModel.percent)}</span>
                    </div>
                )}
                
                {mode !== "causa" && d.topAnalysis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Search size={14} color="#8B5CF6" />
                        <span style={{color: "#94a3b8"}}>Causa Princ.:</span> 
                        <span style={{color: "#f8fafc", fontWeight: 600}}>{d.topAnalysis.name} {formatPercent(d.topAnalysis.percent)}</span>
                    </div>
                )}
                
                {mode !== "sintoma" && d.topFailure && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileWarning size={14} color="#EC4899" />
                        <span style={{color: "#94a3b8"}}>Sintoma Princ.:</span> 
                        <span style={{color: "#f8fafc", fontWeight: 600}}>{d.topFailure.name} {formatPercent(d.topFailure.percent)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
        <text x={x + width + 8} y={y + height / 2 + 1} fill="#e2e8f0" textAnchor="start" dominantBaseline="middle" style={{ fontSize: 11, fontWeight: "bold" }}>
            {value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PPM
        </text>
    );
};