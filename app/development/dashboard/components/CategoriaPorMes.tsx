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
} from "recharts";

/* ======================================================
   CORES FIXAS — SIGMA-Q (CATEGORIAS)
====================================================== */
const COLORS: Record<string, string> = {
  BBS: "#60A5FA",
  CM: "#2563EB",
  TV: "#22C55E",
  MWO: "#F59E0B",
  TW: "#8B5CF6",
  TM: "#EC4899",
  ARCON: "#14B8A6",
  NBX: "#F97316",
};

/* ======================================================
   META DE NEGÓCIO
====================================================== */
const META_PPM = 5200;

/* ======================================================
   TIPOS
====================================================== */
interface CategoriaMesItem {
  month: string;
  production: number;
  totalDefects: number; // 🔥 total de defeitos (linhas, sem ocorrência)
  [categoria: string]: any; // defeitos absolutos por categoria
}

interface PpmMonthlyTrendItem {
  month: string;
  ppm: number | null;
}

interface Props {
  data?: CategoriaMesItem[];
  ppmMonthlyTrend?: PpmMonthlyTrendItem[];
}

/* ======================================================
   UTILS
====================================================== */
function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());
}

/* ======================================================
   CUSTOM LABEL (DENTRO DA BARRA)
   Mostra o valor DO SEGMENTO se a barra for alta o suficiente
====================================================== */
const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  // Só mostra se a altura da barra for maior que 20px e valor > 0
  if (height < 20 || !value) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      style={{
        fontSize: 10,
        fontWeight: "bold",
        pointerEvents: "none",
        textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
      }}
    >
      {value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   CUSTOM LABEL (TOPO DA BARRA)
   Mostra o PPM Total do Mês (soma das partes)
====================================================== */
const renderTotalLabel = (props: any, chartData: any[]) => {
  const { x, y, width, index } = props;
  const item = chartData[index];

  // Recalcula o total somando as partes visíveis no gráfico
  const categorias = Object.keys(COLORS);
  const totalPpm = categorias.reduce((acc, cat) => acc + (item[cat] || 0), 0);

  if (!totalPpm) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 10} // Um pouco acima da barra
      fill="#cbd5e1"
      textAnchor="middle"
      style={{ fontSize: 11, fontWeight: "bold" }}
    >
      {totalPpm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   COMPONENTE
====================================================== */
export default function CategoriaPorMes({
  data,
  ppmMonthlyTrend,
}: Props) {
  /* ===============================
     GUARD
  =============================== */
  if (
    !data ||
    !ppmMonthlyTrend ||
    data.length === 0 ||
    ppmMonthlyTrend.length === 0
  ) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
          height: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        Nenhum dado de categoria disponível
      </div>
    );
  }

  const categorias = Object.keys(COLORS);

  /* ======================================================
     NORMALIZAÇÃO
  ====================================================== */
  const chartData = data
    .filter((m) => m.production > 0 && m.totalDefects > 0)
    .map((m) => {
      const trend = ppmMonthlyTrend.find(
        (t) => t.month === m.month && t.ppm !== null
      );

      const ppmTotal = trend?.ppm ?? 0;

      const row: any = {
        month: m.month,
        production: m.production,
        totalDefects: m.totalDefects,
      };

      categorias.forEach((cat) => {
        const defeitosCategoria = m[cat] ?? 0;

        row[cat] =
          m.totalDefects > 0
            ? (defeitosCategoria / m.totalDefects) * ppmTotal
            : 0;
      });

      return row;
    });

  const maxPpm =
    chartData.length > 0
      ? Math.max(
          ...chartData.map((m) =>
            categorias.reduce(
              (acc, cat) => acc + (m[cat] ?? 0),
              0
            )
          ),
          META_PPM
        ) * 1.2
      : META_PPM * 1.2;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 24,
        height: 380,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ fontSize: "1.1rem" }}>
        📊 Categoria por Mês (PPM)
      </h2>

      {/* LEGENDA */}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 13,
          opacity: 0.85,
          flexWrap: "wrap",
        }}
      >
        {categorias.map((cat) => (
          <div key={cat} style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: COLORS[cat],
              }}
            />
            {cat}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />

            <YAxis
              domain={[0, maxPpm]}
              tickFormatter={(v) =>
                `${Math.round(v).toLocaleString("pt-BR")} PPM`
              }
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />

            {/* 🔴 LINHA DE META (COM RÓTULO FORÇADO) */}
            <ReferenceLine
              y={META_PPM}
              stroke="#EF4444"
              strokeDasharray="6 6"
              strokeWidth={2}
            >
              <Label 
                value={`Meta ${META_PPM.toLocaleString("pt-BR")} PPM`} 
                position="insideTopRight" 
                fill="#EF4444" 
                fontSize={12} 
                fontWeight={600}
                offset={10}
              />
            </ReferenceLine>

            {/* TOOLTIP */}
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              labelFormatter={(label) => {
                const raw = data.find((d) => d.month === label);
                const trend = ppmMonthlyTrend.find(
                  (t) => t.month === label && t.ppm !== null
                );

                return (
                  `${formatMonth(label)}\n` +
                  `Produção: ${raw?.production.toLocaleString("pt-BR")}\n` +
                  `PPM Total: ${
                    trend
                      ? trend.ppm!.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "-"
                  }`
                );
              }}
              formatter={(value: number, name: string, props: any) => {
                const raw = data.find(
                  (d) => d.month === props.payload.month
                );

                const defeitos = raw?.[name] ?? 0;

                return [
                  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PPM • ${defeitos} defeitos`,
                  name,
                ];
              }}
              contentStyle={{
                whiteSpace: "pre-line",
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                fontSize: 13,
              }}
            />

            {/* BARRAS EMPILHADAS */}
            {categorias.map((cat, index, arr) => {
              const isLast = index === arr.length - 1;

              return (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={COLORS[cat]}
                >
                  {/* ✅ Label Interno: Vinculado ao dataKey específico para mostrar valor correto do segmento */}
                  <LabelList 
                    dataKey={cat} 
                    content={renderCustomBarLabel} 
                  />

                  {/* ✅ Label de Total no Topo: Apenas na última barra */}
                  {isLast && (
                    <LabelList
                      dataKey={cat}
                      position="top"
                      content={(props) => renderTotalLabel(props, chartData)}
                    />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}