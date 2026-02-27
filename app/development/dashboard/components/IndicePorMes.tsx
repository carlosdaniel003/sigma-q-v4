"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Label,
  CartesianGrid
} from "recharts";
import { TrendItem } from "../hooks/useDashboard"; 
import { 
  BarChart2, 
  Activity, 
  Package, 
  AlertCircle 
} from "lucide-react";

import "./IndicePorMes-glass.css"; // ✅ NOVO CSS IMPORTADO

interface Props {
  data: TrendItem[];
  tipoLabel: string;
  metaDinamica?: number; 
}

/* ======================================================
   UTILS DE FORMATAÇÃO
====================================================== */
function formatLabel(value: string, tipo: string): string {
  if (!value) return "";
  
  const t = tipo.toLowerCase();

  if (t === "dia") {
      const parts = value.split("-");
      if (parts.length === 3) {
          const d = parts[2].padStart(2, "0");
          const m = parts[1].padStart(2, "0");
          return `${d}/${m}`;
      }
  }
  
  if (t === "semana") {
      if (value.includes("W")) {
          const w = value.split("-W")[1];
          return `S${Number(w)}`; 
      }
  }

  if (value.length >= 7) {
      const [y, m] = value.split("-");
      const date = new Date(Number(y), Number(m) - 1, 1);
      if (!isNaN(date.getTime())) {
          const monthName = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);
          return `${monthName.toUpperCase()}/${y.substring(2)}`; 
      }
  }

  return value;
}

/* ======================================================
   CUSTOM LABELS PARA BARRAS EMPILHADAS
====================================================== */
const renderSafeLabel = (props: any, currentMeta: number) => {
  const { x, y, width, height, value } = props;
  const totalPpm = Number(value || 0);

  if (totalPpm > currentMeta) return null;
  if (width < 70) return null;

  return (
    <text
      x={x + width - 8}
      y={y + height / 2}
      fill="#f8fafc"
      textAnchor="end"
      dominantBaseline="middle"
      style={{ fontSize: 11, fontWeight: "bold", pointerEvents: "none" }}
    >
      {totalPpm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

const renderExcessLabel = (props: any, currentMeta: number) => {
  const { x, y, width, height, value } = props;
  const totalPpm = Number(value || 0);

  if (totalPpm <= currentMeta) return null;
  
  return (
    <text
      x={x + width + 5} 
      y={y + height / 2}
      fill="#fca5a5" 
      textAnchor="start"
      dominantBaseline="middle"
      style={{ fontSize: 11, fontWeight: "bold", pointerEvents: "none" }}
    >
      {totalPpm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   COMPONENTE
====================================================== */
export default function IndicePorMes({ data, tipoLabel, metaDinamica = 5200 }: Props) {
  
  // 1. PREPARAÇÃO DOS DADOS
  const chartData = (data || [])
    .filter(d => d.production > 0)
    .map(d => {
        const ppmReal = d.production > 0 ? (d.defects / d.production) * 1000000 : 0;
        const ppmSafe = Math.min(ppmReal, metaDinamica); 
        const ppmExcess = Math.max(0, ppmReal - metaDinamica); 

        return {
            labelKey: d.name, 
            ppmTotal: Number(ppmReal.toFixed(2)), 
            ppmSafe: ppmSafe,
            ppmExcess: ppmExcess,
            production: d.production,
            defects: d.defects
        };
    });

  if (chartData.length === 0) {
     return (
        <div className="evolucao-chart-container">
            <h2 className="evolucao-title">
              <BarChart2 size={20} color="#60A5FA" />
              Evolução Temporal ({tipoLabel})
            </h2>
            <div className="evolucao-empty-state">
               Nenhum dado de histórico disponível para esta seleção.
            </div>
        </div>
     );
  }

  const maxVal = Math.max(...chartData.map(d => d.ppmTotal), metaDinamica) * 1.3;

  return (
    <div className="evolucao-chart-container">
      
      <h2 className="evolucao-title">
        <BarChart2 size={20} color="#60A5FA" />
        Evolução Temporal ({tipoLabel})
      </h2>

      <div className="evolucao-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 80, left: 10, bottom: 5 }} 
            barCategoryGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            
            <XAxis type="number" hide domain={[0, maxVal]} />
            
            <YAxis 
                dataKey="labelKey" 
                type="category" 
                tickFormatter={(val) => formatLabel(val, tipoLabel)}
                tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 500 }}
                width={60}
                axisLine={false}
                tickLine={false}
                interval={0} 
            />

            <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                            <div style={{ 
                                background: "rgba(15, 23, 42, 0.85)", 
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.15)", 
                                padding: "16px", 
                                borderRadius: "16px", 
                                fontSize: "12px", 
                                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                                minWidth: 200
                            }}>
                                <p style={{ fontWeight: 800, color: "#f8fafc", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                                    {formatLabel(label as string, tipoLabel)}
                                </p>
                                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                    <Activity size={14} color={dataItem.ppmTotal > metaDinamica ? "#EF4444" : "#60a5fa"} />
                                    <span style={{ color: dataItem.ppmTotal > metaDinamica ? "#fca5a5" : "#60a5fa" }}>
                                        PPM: <strong>{dataItem.ppmTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "#cbd5e1", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Package size={14} /> Prod:
                                        </span>
                                        <strong>{dataItem.production.toLocaleString("pt-BR")}</strong>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fca5a5" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <AlertCircle size={14} /> Defeitos:
                                        </span>
                                        <strong>{dataItem.defects.toLocaleString("pt-BR")}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
            />

            <ReferenceLine x={metaDinamica} stroke="#EF4444" strokeDasharray="4 4" opacity={0.8}>
                <Label 
                    value={`Meta ${metaDinamica.toLocaleString("pt-BR")}`} 
                    position="insideTopRight" 
                    fill="#EF4444" 
                    fontSize={11} 
                    offset={-5}
                    fontWeight={700}
                />
            </ReferenceLine>

            {/* BARRA AZUL (SEGURA) */}
            <Bar 
                dataKey="ppmSafe" 
                stackId="a" 
                fill="#3B82F6" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
            >
                <LabelList dataKey="ppmTotal" content={(props: any) => renderSafeLabel(props, metaDinamica)} />
            </Bar>

            {/* BARRA VERMELHA (EXCEDENTE) */}
            <Bar 
                dataKey="ppmExcess" 
                stackId="a" 
                fill="#EF4444" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
            >
                <LabelList dataKey="ppmTotal" content={(props: any) => renderExcessLabel(props, metaDinamica)} />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}