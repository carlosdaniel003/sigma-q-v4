// app\development\dashboard\components\PpmDinamico.tsx
"use client";

import React, { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  CartesianGrid,
} from "recharts";
import { 
  BarChart3, 
  Package, 
  AlertCircle, 
  Activity 
} from "lucide-react";

/* ======================================================
   CONSTANTES & MAPEAMENTO
====================================================== */
const COLORS_RESP: Record<string, string> = {
  "FORNECEDOR IMPORTADO": "#60A5FA", 
  "FORNECEDOR LOCAL": "#2563EB",
  "ENGENHARIA/PROJETO": "#8B5CF6",
  "PROCESSO INJEÇÃO": "#F59E0B",
  "PROCESSO LCM": "#D97706",
  "PROCESSO MA": "#EA580C",
  "PROC. ALTO FALANTE": "#C2410C",
  "PROCESSO PTH": "#F97316", 
  "DIP PTH": "#4e2507",
  "PROCESSO PA": "#EF4444"  
};

const COLORS_CAT: Record<string, string> = {
  BBS: "#60A5FA", CM: "#2563EB", TV: "#22C55E", MWO: "#F59E0B",
  TW: "#8B5CF6", TM: "#EC4899", ARCON: "#14B8A6", NBX: "#F97316",
};

const PALETA_MODELOS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6",
  "#F97316", "#06B6D4", "#84CC16", "#A855F7"
];

const COLOR_GERAL = "#3B82F6";

export type PpmViewMode = "geral" | "responsabilidade" | "categoria" | "modelo";

export interface TrendItem {
  name: string; 
  label: string;
  production: number;
  defects: number;
  ppm: number;
  responsabilidade: Record<string, number>;
  categoria: Record<string, number>;
  modelo: Record<string, number>; 
  abs_responsabilidade: Record<string, number>;
  abs_categoria: Record<string, number>;
  abs_modelo: Record<string, number>; 
  totalDefects?: number; 
  totalPpmDisplay?: number;
}

export interface TrendHierarchy {
  monthly: TrendItem[];
  weekly: Record<string, TrendItem[]>;
  daily: Record<string, TrendItem[]>;
}

interface Props {
  viewMode: PpmViewMode; 
  responsabilidadeData?: any[]; 
  categoriaData?: any[];
  ppmMonthlyTrend?: any[];
  trendData: TrendHierarchy; 
  filters?: any;
  allowedModels?: string[];
  metaDinamica?: number; 
}

/* ======================================================
   UTILS DE FORMATAÇÃO
====================================================== */
function formatLabelFull(label: string | number, isContext: boolean = false): string {
  if (!label) return "";
  const strLabel = String(label);

  if (isContext) {
      if (strLabel.match(/^\d{4}-\d{2}$/)) {
        const [y, m] = strLabel.split("-").map(Number);
        const date = new Date(y, m - 1, 1);
        const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
        return `MÊS DE ${monthName.toUpperCase()}`; 
      }
      if (strLabel.includes("W")) {
        const weekNum = strLabel.split("-")[1].replace("W", "");
        return `TOTAL DA SEMANA ${Number(weekNum)}`; 
      }
      return "TOTAL DO PERÍODO";
  }
  
  if (strLabel.match(/^\d{4}-\d{2}$/)) {
    const [y, m] = strLabel.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
    return monthName.charAt(0).toUpperCase() + monthName.slice(1); 
  }
  
  if (strLabel.includes("W")) {
      const weekNum = strLabel.split("-")[1].replace("W", "");
      return `Semana ${Number(weekNum)}`; 
  }

  if (strLabel.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = strLabel.split("-");
      const day = parts[2];
      return `DIA ${day}`;
  }

  return strLabel; 
}

function formatLabelAxis(label: string | number, isContext: boolean = false): string {
  if (!label) return "";
  
  if (isContext) {
      if (String(label).match(/^\d{4}-\d{2}$/)) {
        const [y, m] = String(label).split("-").map(Number);
        const date = new Date(y, m - 1, 1);
        return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).toUpperCase().replace(".", "");
      }
      if (String(label).includes("W")) {
          return `S${Number(String(label).split("-")[1].replace("W", ""))}`;
      }
      return "TOTAL";
  }

  const strLabel = String(label);
  
  if (strLabel.match(/^\d{4}-\d{2}$/)) {
    const [y, m] = strLabel.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).toUpperCase().replace(".", "");
  }
  
  if (strLabel.includes("W")) {
      return `S${Number(strLabel.split("-")[1].replace("W", ""))}`;
  }

  if (strLabel.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = strLabel.split("-");
      return parts[2]; 
  }

  return strLabel; 
}

/* ======================================================
   CUSTOM LABELS
====================================================== */
const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (height < 20 || !value) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: "bold", pointerEvents: "none", textShadow: "0 0 2px rgba(0,0,0,0.5)" }}>
      {Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
    </text>
  );
};

const renderTotalLabel = (props: any, chartData: any[]) => {
  const { x, y, width, index } = props;
  const item = chartData[index];
  
  if (!item || item.isGap) return null; 

  const totalPpm = item.totalPpmDisplay || 0;

  if (totalPpm === 0) return null;
  
  return (
    <text x={x + width / 2} y={y - 12} fill="#cbd5e1" textAnchor="middle" style={{ fontSize: 11, fontWeight: "bold" }}>
      {Number(totalPpm).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */
export default function PpmDinamico({
  viewMode, 
  trendData, 
  filters,
  allowedModels,
  metaDinamica = 5200 
}: Props) {

  /* ======================================================
      SELEÇÃO DE DADOS & INTELIGÊNCIA DE MODELOS
   ====================================================== */
  const chartData = useMemo(() => {
    let rawItems: TrendItem[] = [];
    let contextItem: TrendItem | null = null;
    
    if (trendData) {
        const { tipo, valor, ano, dia } = filters?.periodo || {};

        if (tipo === "mes" && valor && ano) {
            const monthKey = `${ano}-${String(valor).padStart(2, '0')}`;
            contextItem = trendData.monthly.find(m => m.name === monthKey) || null;
            const weeksInMonth = trendData.weekly[monthKey] || [];
            rawItems = weeksInMonth
                .flatMap(week => trendData.daily[week.name] || [])
                .sort((a, b) => a.name.localeCompare(b.name));
        } 
        else if (tipo === "semana" && valor && ano) {
            const weekKey = `${ano}-W${String(valor).padStart(2, '0')}`;
            const allWeeks = Object.values(trendData.weekly).flat();
            contextItem = allWeeks.find(w => w.name === weekKey) || null;
            rawItems = trendData.daily[weekKey] || [];
            if (dia) {
                rawItems = rawItems.filter(d => d.name <= dia);
            }
        }
        else if (tipo === "semana") {
            const allWeeksArrays = Object.values(trendData.weekly);
            rawItems = allWeeksArrays.flat().sort((a, b) => a.name.localeCompare(b.name));
        }
        else {
            rawItems = trendData.monthly || [];
        }
    }

    // 🔥 REGRA: Remover dias/semanas/meses que não tiveram nem produção nem defeitos
    rawItems = rawItems.filter(item => item.production > 0 || item.defects > 0);
    
    if (contextItem && contextItem.production === 0 && contextItem.defects === 0) {
        contextItem = null;
    }

    // 🔥 LÓGICA TOP 10 MODELOS + OUTROS
    const modelTotals: Record<string, number> = {};
    if (viewMode === "modelo") {
        rawItems.forEach(item => {
            if (item.modelo) {
                Object.entries(item.modelo).forEach(([k, v]) => {
                    if (allowedModels && allowedModels.length > 0 && !allowedModels.includes(k)) return;
                    modelTotals[k] = (modelTotals[k] || 0) + v;
                });
            }
        });
    }
    const sortedModels = Object.keys(modelTotals).sort((a, b) => modelTotals[b] - modelTotals[a]);
    const topModels = new Set(sortedModels.slice(0, 11)); // Mantém os top 11

    let finalRawItems = [...rawItems];
    if (contextItem) {
        finalRawItems = [
            { ...contextItem, isContext: true } as any, 
            { name: "GAP", isGap: true } as any, 
            ...rawItems
        ];
    }

    return finalRawItems.map(item => {
        if ((item as any).isGap) {
            return { name: "GAP", labelAxis: "", isGap: true };
        }

        const isCtx = (item as any).isContext === true;
        
        const base: any = {
            name: item.name,
            labelAxis: formatLabelAxis(item.name, isCtx), 
            fullLabel: formatLabelFull(item.name, isCtx), 
            production: item.production,
            totalDefects: item.defects,
            totalPpmDisplay: item.ppm, 
            abs_resp: item.abs_responsabilidade,
            abs_cat: item.abs_categoria,
            abs_mod: item.abs_modelo,
            // 🔥 GUARDAMOS OS DADOS BRUTOS ORIGINAIS AQUI PARA O TOOLTIP LER DEPOIS!
            _raw_modelo_data: item.modelo || {}, 
            isContext: isCtx 
        };

        if (viewMode === "responsabilidade") {
             const sourceObj = item.responsabilidade || {};
             Object.assign(base, sourceObj); 
        }
        else if (viewMode === "categoria") {
             Object.assign(base, item.categoria || {});
        }
        else if (viewMode === "modelo") {
             const modObj = item.modelo || {};
             let outrosVal = 0;
             Object.entries(modObj).forEach(([k, v]) => {
                 if (allowedModels && allowedModels.length > 0 && !allowedModels.includes(k)) return;
                 
                 if (topModels.has(k)) {
                     base[k] = v;
                 } else {
                     outrosVal += v; // Agrupa o excedente em OUTROS
                 }
             });
             if (outrosVal > 0) base["OUTROS"] = outrosVal;
        }
        else {
             base["PPM Geral"] = item.ppm;
        }
        
        return base;
    });

  }, [trendData, filters, viewMode, allowedModels]);

  /* ======================================================
      CONFIGURAÇÃO DE CORES E CHAVES
   ====================================================== */
  const keys = useMemo(() => {
    if (viewMode === "geral") return ["PPM Geral"];
    
    if (viewMode === "responsabilidade") {
        const respFilter = filters?.responsabilidade;
        if (respFilter && respFilter !== "Todos") {
            if (respFilter === "AGRUPAMENTO DE PROCESSOS") return Object.keys(COLORS_RESP).filter(key => key.startsWith("PROC") || key.includes("PTH") || key.includes("LCM") || key.includes("DIP"));
            if (respFilter === "AGRUPAMENTO DE FORNECEDORES") return ["FORNECEDOR IMPORTADO", "FORNECEDOR LOCAL"];
            return [respFilter];
        }

        const activeResp = new Set<string>();
        chartData.forEach(d => {
             if ((d as any).isGap) return;
             Object.keys(d).forEach(key => {
                 if (COLORS_RESP[key] && typeof d[key] === 'number' && d[key] > 0) activeResp.add(key);
             });
        });
        return activeResp.size > 0 ? Array.from(activeResp) : Object.keys(COLORS_RESP);
    }
    
    if (viewMode === "categoria") {
        if (filters?.categoria && filters.categoria !== "Todos") return [filters.categoria];
        return Object.keys(COLORS_CAT);
    }

    if (viewMode === "modelo") {
        const activeModels = new Set<string>();
        chartData.forEach(d => {
             if ((d as any).isGap) return;
             Object.keys(d).forEach(k => {
                 if (!['name', 'labelAxis', 'fullLabel', 'production', 'defects', 'ppm', 'totalDefects', 'totalPpmDisplay', 'abs_resp', 'abs_cat', 'abs_mod', 'isContext', 'isGap', '_raw_modelo_data'].includes(k)) {
                     activeModels.add(k);
                 }
             });
        });
        
        // Garante que "OUTROS" fica sempre no final da lista da legenda
        const sortedArray = Array.from(activeModels).filter(m => m !== "OUTROS");
        if (activeModels.has("OUTROS")) sortedArray.push("OUTROS");
        
        return sortedArray;
    }

    return [];
  }, [viewMode, filters, chartData]); 

  const colors = useMemo(() => {
    if (viewMode === "geral") return { "PPM Geral": COLOR_GERAL };
    if (viewMode === "responsabilidade") return COLORS_RESP;
    if (viewMode === "categoria") return COLORS_CAT;
    
    if (viewMode === "modelo") {
        const mapping: any = {};
        let colorIdx = 0;
        keys.forEach((k) => {
            if (k === "OUTROS") {
                mapping[k] = "#64748b"; // Cinza para o OUTROS
            } else {
                mapping[k] = PALETA_MODELOS[colorIdx % PALETA_MODELOS.length];
                colorIdx++;
            }
        });
        return mapping;
    }
    
    return {};
  }, [viewMode, keys]);

  /* ======================================================
      DADOS FINAIS
   ====================================================== */
  const finalData = useMemo(() => {
      return chartData.map(d => {
          if ((d as any).isGap) return { ...d, _stackTotal: null };
          const realTotalPpm = d.totalPpmDisplay || 0;
          return { ...d, _stackTotal: realTotalPpm > 0 ? realTotalPpm : null };
      });
  }, [chartData]);

  const hasContextItem = finalData.length > 0 && (finalData[0] as any).isContext;

  const maxVal = chartData.length > 0 
    ? Math.max(...chartData.map((d: any) => d.totalPpmDisplay || 0), metaDinamica) * 1.2
    : metaDinamica;

  const dominantInsight = useMemo(() => {
      if (!finalData.length || keys.length <= 1) return null;

      const totals: Record<string, number> = {};
      let grandTotal = 0;

      keys.forEach(key => {
          totals[key] = 0;
          finalData.forEach(item => {
              if ((item as any).isGap || (item as any).isContext) return;
              
              const val = item[key];
              if (typeof val === 'number') {
                  totals[key] += val;
                  grandTotal += val;
              }
          });
      });

      if (grandTotal === 0) return null;

      const winnerKey = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
      const winnerValue = totals[winnerKey];
      const percentage = (winnerValue / grandTotal) * 100;

      return {
          name: winnerKey,
          percentage: percentage.toFixed(0),
          color: colors[winnerKey] || "#fff"
      };
  }, [finalData, keys, colors]);

  const customTicks = useMemo(() => {
      const tickCount = 5;
      const step = Math.ceil(maxVal / tickCount / 1000) * 1000;
      const ticks = [];
      
      for (let i = 0; i * step <= maxVal; i++) {
          const val = i * step;
          if (Math.abs(val - metaDinamica) > (maxVal * 0.05)) {
              ticks.push(val);
          }
      }
      ticks.push(metaDinamica); 
      return ticks.sort((a, b) => a - b);
  }, [maxVal, metaDinamica]);

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={18} color="#60A5FA" />
              <span>
                {viewMode === "geral" && "PPM Geral (Evolução)"}
                {viewMode === "responsabilidade" && `PPM por Responsabilidade${filters?.categoria ? ` (${filters.categoria})` : ""}`}
                {viewMode === "categoria" && `PPM por Categoria${filters?.modelo ? ` (${filters.modelo})` : ""}`}
                {viewMode === "modelo" && `PPM por Modelo${filters?.categoria ? ` (${filters.categoria})` : ""}`}
              </span>
            </h2>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.90rem", color: "#64748b" }}>
                    {filters?.periodo?.tipo === "mes" && filters.periodo.valor ? "Total Mensal + Detalhe Diário" :
                    filters?.periodo?.tipo === "semana" && filters.periodo.valor ? "Total Semanal + Detalhe Diário" : 
                    filters?.periodo?.tipo === "semana" ? "Visualização Semanal (Ano Todo)" :
                    "Visualização Mensal"}
                </span>

                {dominantInsight && (
                    <>
                        <span style={{ color: "#475569" }}>|</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dominantInsight.color }} />
                            <span style={{ fontSize: "0.90rem", color: "#e2e8f0" }}>
                                <strong style={{ color: dominantInsight.color }}>{dominantInsight.name}</strong>
                                <span style={{ opacity: 0.7 }}> domina com </span>
                                <strong>{dominantInsight.percentage}%</strong>
                                <span style={{ opacity: 0.7 }}> do acumulado</span>
                            </span>
                        </div>
                    </>
                )}
            </div>
          </div>

          <div style={legendContainerStyle}>
            {keys.map((key) => (
              <div key={key} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[key], flexShrink: 0 }} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }} title={key}>{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, width: "100%", minHeight: 0, position: "relative" }}>
        {chartData.length === 0 ? (
             <div style={{...emptyContainerStyle, height: "100%"}}>
               <span>Sem dados para esta seleção.</span>
             </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
                data={finalData} 
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                barCategoryGap={finalData.length < 10 ? "20%" : "10%"}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                    dataKey="labelAxis" 
                    tick={(props) => {
                        const { x, y, payload, index } = props;
                        const dataItem = finalData[index];
                        if (!dataItem || (dataItem as any).isGap) return null;
                        const isTotal = (dataItem as any).isContext;
                        return (
                            <g transform={`translate(${x},${y})`}>
                                <text x={0} y={0} dy={16} 
                                      textAnchor="middle" 
                                      fill={isTotal ? "#60A5FA" : "#cbd5e1"} 
                                      fontWeight={isTotal ? "bold" : "normal"}
                                      fontSize={11}>
                                    {payload.value}
                                </text>
                            </g>
                        );
                    }}
                    axisLine={false} tickLine={false} interval={0} 
                />
                
                <YAxis 
                    domain={[0, maxVal]} 
                    ticks={customTicks} 
                    tick={({ x, y, payload }) => {
                        const val = Number(payload.value);
                        const isMeta = Math.abs(val - metaDinamica) < 10; 
                        return (
                            <text x={x} y={y} dy={4} textAnchor="end" 
                                  fill={isMeta ? "#EF4444" : "#cbd5e1"} 
                                  fontWeight={isMeta ? "bold" : "normal"}
                                  fontSize={11}>
                                {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                            </text>
                        );
                    }}
                    width={40} 
                    axisLine={false} 
                    tickLine={false} 
                />
                
                <ReferenceLine y={metaDinamica} stroke="#EF4444" strokeDasharray="4 4" />

                {hasContextItem && (
                    <ReferenceLine x={1} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                )}

                {/* 🔥 TOOLTIP: LÓGICA DE MOSTRAR TUDO NO MODO MODELO */}
                <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                wrapperStyle={{ zIndex: 9999, pointerEvents: 'auto' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        
                        if (dataItem.isGap) return null;

                        const isCtx = dataItem.isContext;

                        // Se estivermos na visão Modelo, pegamos nos dados brutos completos para o tooltip.
                        // Caso contrário, usamos o payload padrão do Recharts.
                        let tooltipItems: any[] = [];
                        
                        if (viewMode === "modelo" && dataItem._raw_modelo_data) {
                            const rawData = dataItem._raw_modelo_data;
                            tooltipItems = Object.entries(rawData)
                                .map(([key, value]) => ({
                                    name: key,
                                    value: value,
                                    // Tenta usar a cor do mapeamento, senão gera uma baseada no índice
                                    color: colors[key] || PALETA_MODELOS[Math.floor(Math.random() * PALETA_MODELOS.length)]
                                }))
                                .filter(item => {
                                    if (allowedModels && allowedModels.length > 0) return allowedModels.includes(item.name);
                                    return (item.value as number) > 0;
                                })
                                .sort((a, b) => (b.value as number) - (a.value as number)); // Ordena do maior pro menor
                        } else {
                            tooltipItems = payload.filter(entry => entry.dataKey !== "_stackTotal");
                        }

                        return (
                            <div style={{ 
                                background: "rgba(15,23,42,0.9)", 
                                backdropFilter: "blur(20px)", 
                                border: isCtx ? "1px solid #60A5FA" : "1px solid rgba(255,255,255,0.15)", 
                                padding: "16px", 
                                borderRadius: "12px", 
                                fontSize: "13px", 
                                boxShadow: "0 10px 30px rgba(0,0,0,0.8)", 
                                minWidth: 200,
                                maxHeight: "300px", // Limita a altura se houver MUITOS modelos
                                overflowY: "auto" // Permite scroll dentro do tooltip
                            }}>
                                <p style={{ fontWeight: "bold", marginBottom: "8px", color: isCtx ? "#60A5FA" : "#fff", fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
                                    {dataItem.fullLabel}
                                </p>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8, paddingBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Package size={14} /> Produção:
                                        </span>
                                        <strong>{Number(dataItem.production).toLocaleString("pt-BR")}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#fca5a5" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <AlertCircle size={14} /> Defeitos:
                                        </span>
                                        <strong>{Number(dataItem.totalDefects).toLocaleString("pt-BR")}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#60a5fa" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Activity size={14} /> PPM Total:
                                        </span>
                                        <strong>{Number(dataItem.totalPpmDisplay).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {tooltipItems.map((entry: any, index: number) => (
                                        <div key={index} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, boxShadow: `0 0 5px ${entry.color}`, flexShrink: 0 }} />
                                            <span style={{ color: "#94a3b8", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }} title={entry.name}>{entry.name}:</span>
                                            <span style={{ color: "#fff", fontWeight: 700 }}>{Number(entry.value).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} PPM</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
                />

                <Line
                    type="linear"
                    dataKey="_stackTotal"
                    stroke="#fff"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: "#0f172a", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                    connectNulls={false} 
                />

                {keys.map((key, index) => {
                const isLast = index === keys.length - 1;
                return (
                    <Bar key={key} dataKey={key} stackId="a" fill={colors[key]} maxBarSize={60}>
                    <LabelList dataKey={key} content={renderCustomBarLabel} />
                    {isLast && (
                        <LabelList dataKey="_stackTotal" position="top" content={(props) => renderTotalLabel(props, finalData)} />
                    )}
                    </Bar>
                );
                })}
            </ComposedChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   ESTILOS - GLASSMORPHISM ATUALIZADO (Z-INDEX 50)
====================================================== */
const containerStyle: React.CSSProperties = {
  backdropFilter: "blur(35px)",
  WebkitBackdropFilter: "blur(35px)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
  borderRadius: 24,
  padding: 24,
  height: 480, 
  display: "flex",
  flexDirection: "column",
  position: "relative",
  zIndex: 50, // 🔥 GARANTE QUE FICA ACIMA DO RANKING
};

const emptyContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
};

const legendContainerStyle: React.CSSProperties = {
  display: "flex", 
  gap: "6px 12px", 
  opacity: 0.9, 
  flexWrap: "wrap", 
  color: "#cbd5e1", 
  justifyContent: "flex-end", 
  maxWidth: "50%",
  maxHeight: "60px", // 🔥 EVITA QUE O GRÁFICO SEJA ESMAGADO SE HOUVER MUITOS ITENS
  overflowY: "auto",
  overflowX: "hidden"
};