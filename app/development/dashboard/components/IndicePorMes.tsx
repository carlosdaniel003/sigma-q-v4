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

interface Props {
  data: TrendItem[];
  tipoLabel: string;
  metaDinamica?: number; // ✅ Recebe a meta dinâmica da categoria
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
   CUSTOM LABELS PARA BARRAS EMPILHADAS (COM 2 DECIMAIS)
====================================================== */

// Label para a parte AZUL (Segura)
const renderSafeLabel = (props: any, currentMeta: number) => {
  const { x, y, width, height, value } = props;
  const totalPpm = Number(value || 0);

  // Se passou da meta, a responsabilidade de mostrar o número é da parte vermelha.
  if (totalPpm > currentMeta) return null;
  
  // Se a barra azul for muito pequena, não desenha para não cortar
  if (width < 70) return null;

  return (
    <text
      x={x + width - 8}
      y={y + height / 2}
      fill="#fff"
      textAnchor="end"
      dominantBaseline="middle"
      style={{ fontSize: 11, fontWeight: "bold", pointerEvents: "none" }}
    >
      {totalPpm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

// Label para a parte VERMELHA (Excedente)
const renderExcessLabel = (props: any, currentMeta: number) => {
  const { x, y, width, height, value } = props;
  const totalPpm = Number(value || 0);

  // Segurança: se não passou da meta, não desenha
  if (totalPpm <= currentMeta) return null;
  
  return (
    <text
      x={x + width + 5} // Sempre desenha 5px à direita
      y={y + height / 2}
      fill="#EF4444" // Sempre Vermelho
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
  
  // 1. PREPARAÇÃO DOS DADOS (UNIFICAÇÃO MATEMÁTICA E META DINÂMICA)
  const chartData = (data || [])
    .filter(d => d.production > 0)
    .map(d => {
        // ✅ RECALCULO CONSOLIDADO: Garante sincronia exata com o PpmDinamico
        const ppmReal = d.production > 0 ? (d.defects / d.production) * 1000000 : 0;
        
        // Separa o valor em duas partes baseando-se na meta da categoria
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
        <div style={emptyContainerStyle}>
           Nenhum dado de histórico disponível para esta seleção.
        </div>
     );
  }

  // Calcula máximo dinâmico considerando a meta atual
  const maxVal = Math.max(...chartData.map(d => d.ppmTotal), metaDinamica) * 1.3;

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
        <BarChart2 size={18} color="#60A5FA" />
        Evolução Temporal ({tipoLabel})
      </h2>

      <div style={{ flex: 1, minHeight: 0 }}>
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
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
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
                            <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", padding: "12px", borderRadius: "8px", fontSize: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}>
                                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
                                    {formatLabel(label as string, tipoLabel)}
                                </p>
                                <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                    <Activity size={14} color={dataItem.ppmTotal > metaDinamica ? "#EF4444" : "#60a5fa"} />
                                    <span style={{ color: dataItem.ppmTotal > metaDinamica ? "#EF4444" : "#60a5fa" }}>
                                        PPM: <strong>{dataItem.ppmTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "#cbd5e1", marginTop: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <Package size={14} /> 
                                        <span>Prod: {dataItem.production.toLocaleString("pt-BR")}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fca5a5" }}>
                                        <AlertCircle size={14} /> 
                                        <span>Def: {dataItem.defects.toLocaleString("pt-BR")}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
            />

            {/* ✅ Linha de Referência Dinâmica baseada na meta da categoria */}
            <ReferenceLine x={metaDinamica} stroke="#EF4444" strokeDasharray="4 4">
                <Label 
                    value={`Meta ${metaDinamica.toLocaleString("pt-BR")} PPM`} 
                    position="insideTopRight" 
                    fill="#EF4444" 
                    fontSize={10} 
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

const containerStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 24,
  height: 480,
  display: "flex",
  flexDirection: "column",
};

const emptyContainerStyle: React.CSSProperties = {
  ...containerStyle,
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
};