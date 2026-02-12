"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDiagnosticoFilters } from "../store/diagnosticoFilters";

/* ======================================================
   TIPOS DE OPÇÕES (BACKEND)
====================================================== */
interface FiltroOptions {
  semanas: { semana: number; ano: number }[];
  meses: { mes: number; ano: number }[];
  modelos: string[];
  categorias: string[];
  responsabilidades: string[];
  turnos: string[];
  modeloCategoriaMap: Record<string, string>;
}

/* ======================================================
   SIDEBAR DE FILTROS
====================================================== */
export default function SidebarFiltros() {
  const {
    draftFilters,
    setDraftFilter,
    applyFilters,
    resetFilters,
  } = useDiagnosticoFilters();

  const [options, setOptions] = useState<FiltroOptions | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        const res = await fetch("/api/diagnostico/filtros");
        if (!res.ok) return;
        const json: FiltroOptions = await res.json();
        setOptions(json);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const modelosFiltrados = useMemo(() => {
    if (!options) return [];
    if (!draftFilters.categoria) return options.modelos;
    return options.modelos.filter(
      (modelo) =>
        options.modeloCategoriaMap[modelo] === draftFilters.categoria
    );
  }, [options, draftFilters.categoria]);

  // ✅ FILTRO DE RESPONSABILIDADE: Injeta Grupos Virtuais
  const responsabilidadesFiltradas = useMemo(() => {
    if (!options) return [];
    
    // 1. Limpa a lista original
    const listaLimpa = options.responsabilidades.filter(
      (resp) => 
        resp !== "NÃO MOSTRAR NO INDICE" && 
        resp !== "NAO MOSTRAR NO INDICE" &&
        resp !== "NÃO MOSTRAR NO ÍNDICE"
    );

    // 2. Adiciona os grupos no topo da lista
    return [
        "AGRUPAMENTO DE PROCESSOS",
        "AGRUPAMENTO DE FORNECEDORES",
        ...listaLimpa
    ];
  }, [options]);

  useEffect(() => {
    if (!options || !draftFilters.modelo) return;
    const categoriaVinculada = options.modeloCategoriaMap[draftFilters.modelo];
    if (categoriaVinculada && draftFilters.categoria !== categoriaVinculada) {
      setDraftFilter("categoria", categoriaVinculada);
    }
  }, [draftFilters.modelo, options, setDraftFilter]);

  const periodoValido =
    draftFilters.periodo.valor !== null && draftFilters.periodo.ano !== null;

  if (!options || loading) {
    return (
      <aside style={containerStyle}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Carregando filtros...</span>
      </aside>
    );
  }

  return (
    <aside style={containerStyle}>
      <h3 style={{ fontSize: "1rem" }}>Filtros</h3>

      <Select
        label="Tipo de período"
        value={draftFilters.periodo.tipo}
        onChange={(v: string) =>
          setDraftFilter("periodo", {
            tipo: v as "semana" | "mes",
            valor: null,
            ano: null,
          })
        }
        options={["semana", "mes"]}
        renderOption={(v: string) => (v === "semana" ? "Semanal" : "Mensal")}
      />

      {/* SELEÇÃO DE SEMANA */}
      {draftFilters.periodo.tipo === "semana" && (
        <Select
          label="Semana (Referência)"
          value={
            draftFilters.periodo.valor && draftFilters.periodo.ano
              ? `${draftFilters.periodo.valor}-${draftFilters.periodo.ano}`
              : ""
          }
          onChange={(v: string) => {
            const [semana, ano] = v.split("-").map(Number);
            setDraftFilter("periodo", { ...draftFilters.periodo, valor: semana, ano });
          }}
          options={options.semanas.map((s) => `${s.semana}-${s.ano}`)}
          renderOption={(v: string) => {
            const [semana, ano] = v.split("-");
            return `Semana ${semana}/${ano}`;
          }}
        />
      )}

      {/* SELEÇÃO DE MÊS (DINÂMICA) */}
      {draftFilters.periodo.tipo === "mes" && (
        <Select
          label="Mês (Referência)"
          value={
            draftFilters.periodo.valor && draftFilters.periodo.ano
              ? `${draftFilters.periodo.valor}-${draftFilters.periodo.ano}`
              : ""
          }
          onChange={(v: string) => {
            const [mes, ano] = v.split("-").map(Number);
            setDraftFilter("periodo", { ...draftFilters.periodo, valor: mes, ano });
          }}
          options={options.meses.map((m) => `${m.mes}-${m.ano}`)}
          renderOption={(v: string) => {
            const [mes, ano] = v.split("-");
            const data = new Date(Number(ano), Number(mes) - 1, 1);
            const nomeMes = data.toLocaleString("pt-BR", { month: "long" });
            return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano}`;
          }}
        />
      )}

      <Select
        label="Categoria"
        value={draftFilters.categoria ?? ""}
        onChange={(v: string) => setDraftFilter("categoria", v)}
        options={options.categorias}
      />

      <Select
        label="Modelo"
        value={draftFilters.modelo ?? ""}
        onChange={(v: string) => setDraftFilter("modelo", v)}
        options={modelosFiltrados}
        disabled={modelosFiltrados.length === 0}
      />

      <Select
        label="Responsabilidade"
        value={draftFilters.responsabilidade ?? ""}
        onChange={(v: string) => setDraftFilter("responsabilidade", v)}
        options={responsabilidadesFiltradas} // ✅ Lista com grupos injetados
      />

      <Select
        label="Turno"
        value={draftFilters.turno ?? ""}
        onChange={(v: string) => setDraftFilter("turno", v)}
        options={options.turnos}
      />

      <button
        onClick={applyFilters}
        disabled={!periodoValido}
        style={{
          ...buttonStyle,
          background: periodoValido ? "#2563eb" : "#334155",
          cursor: periodoValido ? "pointer" : "not-allowed",
          opacity: periodoValido ? 1 : 0.6,
        }}
      >
        Buscar
      </button>

      <button onClick={resetFilters} style={buttonStyle}>
        Limpar filtros
      </button>
    </aside>
  );
}

function Select({ label, value, onChange, options, disabled = false, renderOption }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <option value="">Selecione</option>
        {options.map((o: string) => (
          <option key={o} value={o}>
            {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const labelStyle: React.CSSProperties = { fontSize: 12, color: "#cbd5e1" };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 13,
};
const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "8px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 13,
};