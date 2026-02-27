"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDashboardFilters } from "../store/dashboardFilters";
import "./SidebarDashboard-glass.css";

interface FiltroOptions {
  semanas: { semana: number; ano: number }[];
  meses: { mes: number; ano: number }[];
  modelos: string[];
  categorias: string[];
  responsabilidades: string[];
  turnos: string[];
  modeloCategoriaMap: Record<string, string>;
}

export default function SidebarDashboard() {
  const {
    draftFilters,
    setDraftFilter,
    applyFilters,
    resetFilters,
  } = useDashboardFilters();

  const [options, setOptions] = useState<FiltroOptions | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega opções do backend
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

  // Filtra modelos baseado na categoria selecionada
  const modelosFiltrados = useMemo(() => {
    if (!options) return [];
    if (!draftFilters.categoria) return options.modelos;
    return options.modelos.filter(
      (modelo) =>
        options.modeloCategoriaMap[modelo] === draftFilters.categoria
    );
  }, [options, draftFilters.categoria]);

  // ✅ Filtra responsabilidades e INJETA os grupos virtuais
  const responsabilidadesFiltradas = useMemo(() => {
    if (!options) return [];
    
    // 1. Limpa a lista original
    const listaLimpa = options.responsabilidades.filter(
      (resp) => 
        !resp.includes("NÃO MOSTRAR") && 
        !resp.includes("NAO MOSTRAR")
    );

    // 2. Adiciona os grupos no topo da lista
    return [
        "AGRUPAMENTO DE PROCESSOS",
        "AGRUPAMENTO DE FORNECEDORES",
        ...listaLimpa
    ];
  }, [options]);

  // Auto-seleciona categoria ao escolher modelo
  useEffect(() => {
    if (!options || !draftFilters.modelo) return;
    const categoriaVinculada = options.modeloCategoriaMap[draftFilters.modelo];
    if (categoriaVinculada && draftFilters.categoria !== categoriaVinculada) {
      setDraftFilter("categoria", categoriaVinculada);
    }
  }, [draftFilters.modelo, options, setDraftFilter]);

  // Validação do botão buscar
  const periodoValido = useMemo(() => {
      const { tipo } = draftFilters.periodo;
      // Se tiver um tipo selecionado (mes ou semana), já é válido.
      return !!tipo;
  }, [draftFilters.periodo]);

  // Calcula os dias da semana selecionada
  const diasDaSemana = useMemo(() => {
      if (draftFilters.periodo.tipo !== "semana" || !draftFilters.periodo.valor || !draftFilters.periodo.ano) {
          return [];
      }
      return getDaysOfWeek(draftFilters.periodo.valor, draftFilters.periodo.ano);
  }, [draftFilters.periodo]);

  if (!options || loading) {
    return (
      <div className="dash-sidebar-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Carregando filtros...</span>
      </div>
    );
  }

  return (
    <div className="dash-sidebar-container">
      <div className="dash-sidebar-title">
        Filtros Gerais
      </div>

      <div className="dash-sidebar-form">
        
        {/* 1. TIPO DE PERÍODO */}
        <Select
          label="Visualizar por"
          value={draftFilters.periodo.tipo}
          onChange={(v: any) =>
            setDraftFilter("periodo", { tipo: v, valor: null, ano: null, dia: null })
          }
          options={["mes", "semana"]}
          renderOption={(v: any) => (v === "semana" ? "Semanal" : "Mensal")}
          hideAllOption={true}
        />

        {/* 2A. SEMANA ESPECÍFICA */}
        {draftFilters.periodo.tipo === "semana" && (
          <Select
            label="Semana"
            value={
              draftFilters.periodo.valor && draftFilters.periodo.ano
                ? `${draftFilters.periodo.valor}-${draftFilters.periodo.ano}`
                : ""
            }
            onChange={(v: string) => {
              if (!v) {
                  setDraftFilter("periodo", { ...draftFilters.periodo, valor: null, ano: null, dia: null });
                  return;
              }
              const [semana, ano] = v.split("-").map(Number);
              setDraftFilter("periodo", { ...draftFilters.periodo, valor: semana, ano, dia: null }); 
            }}
            options={options.semanas.map((s) => `${s.semana}-${s.ano}`)}
            renderOption={(v: string) => {
              const [semana, ano] = v.split("-");
              return `Sem ${semana}/${ano}`;
            }}
          />
        )}

        {/* 2B. MÊS ESPECÍFICO */}
        {draftFilters.periodo.tipo === "mes" && (
          <Select
            label="Mês"
            value={
              draftFilters.periodo.valor && draftFilters.periodo.ano
                ? `${draftFilters.periodo.valor}-${draftFilters.periodo.ano}`
                : ""
            }
            onChange={(v: string) => {
                if (!v) {
                    setDraftFilter("periodo", { ...draftFilters.periodo, valor: null, ano: null });
                    return;
                }
                const [mes, ano] = v.split("-").map(Number);
                setDraftFilter("periodo", { ...draftFilters.periodo, valor: mes, ano });
            }}
            options={options.meses.map((m) => `${m.mes}-${m.ano}`)}
            renderOption={(v: string) => {
              const [mes, ano] = v.split("-");
              const data = new Date(Number(ano), Number(mes) - 1, 1);
              const nomeMes = data.toLocaleString("pt-BR", { month: "short" });
              return `${nomeMes.toUpperCase()}/${ano}`;
            }}
          />
        )}

        {/* 3. DIA ESPECÍFICO */}
        {draftFilters.periodo.tipo === "semana" && draftFilters.periodo.valor && (
            <Select
                label="Dia"
                value={draftFilters.periodo.dia || ""}
                onChange={(v: string) => setDraftFilter("periodo", { ...draftFilters.periodo, dia: v || null })}
                options={diasDaSemana.map(d => d.value)}
                renderOption={(v: string) => {
                    const d = diasDaSemana.find(day => day.value === v);
                    return d ? d.label : v;
                }}
            />
        )}

        <Select
          label="Categoria"
          value={draftFilters.categoria ?? ""}
          onChange={(v: string) => setDraftFilter("categoria", v || null)}
          options={options.categorias}
        />

        <Select
          label="Modelo"
          value={draftFilters.modelo ?? ""}
          onChange={(v: string) => setDraftFilter("modelo", v || null)}
          options={modelosFiltrados}
          disabled={modelosFiltrados.length === 0}
        />

        <Select
          label="Responsabilidade"
          value={draftFilters.responsabilidade ?? ""}
          onChange={(v: string) => setDraftFilter("responsabilidade", v || null)}
          options={responsabilidadesFiltradas}
        />

        <Select
          label="Turno"
          value={draftFilters.turno ?? ""}
          onChange={(v: string) => setDraftFilter("turno", v || null)}
          options={options.turnos}
        />

        <div className="dash-sidebar-actions">
            <button
                className="dash-sidebar-btn-buscar"
                onClick={applyFilters}
                disabled={!periodoValido}
            >
                Buscar
            </button>

            <button 
                className="dash-sidebar-btn-limpar"
                onClick={resetFilters} 
            >
                Limpar
            </button>
        </div>

      </div>
    </div>
  );
}

// Função auxiliar
function getDaysOfWeek(week: number, year: number) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = simple;
    if (dayOfWeek <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(ISOweekStart);
        d.setDate(d.getDate() + i);
        const value = d.toISOString().split('T')[0]; 
        const label = d.toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: '2-digit' });
        days.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return days;
}

// Sub-Componente de Input (Apenas com as novas classes)
function Select({ label, value, onChange, options, disabled = false, renderOption, hideAllOption = false }: any) {
  return (
    <div className="dash-sidebar-select-group">
      <label className="dash-sidebar-label">{label}</label>
      <select
        className="dash-sidebar-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {!hideAllOption && <option value="">Todos</option>}
        {options.map((o: string) => (
          <option key={o} value={o}>
            {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
    </div>
  );
}