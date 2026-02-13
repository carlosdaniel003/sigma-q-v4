"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboardFilters } from "../store/dashboardFilters";

/* ======================================================
   TIPAGEM
====================================================== */
export interface DetailRow {
  rank: number;
  cod: string;
  falha: string;
  peca: string;
  ref: string;
  analise: string;
  responsabilidade: string;
  modelo: string;
  qtd: number;
  ppm: number;
}

export interface ResponsibilityGroup {
  responsibility: string;
  top3: DetailRow[];
}

export interface TurnoStats {
  turno: string;
  producao: number;
  totalDefeitos: number;
  groups: ResponsibilityGroup[]; 
}

export interface ContextItem {
  name: string;
  qty: number;
  percent: number;
}

export interface CauseItem {
  name: string;
  defects: number;
  ppm: number;
  topModel?: ContextItem;
  topFailure?: ContextItem;
  topRef?: ContextItem;
  topAnalysis?: ContextItem; 
}

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

interface PpmMonthlyTrendItem {
  month: string;
  production: number;
  defects: number;
  ppm: number | null;
}

export interface ResponsabilidadeMensalItem {
  month: string;
  production: number;
  totalDefects: number;
  "FORN. IMPORTADO": number;
  "FORN. LOCAL": number;
  "PROCESSO": number;
  "PROJETO": number;
}

export interface CategoriaMensalItem {
  month: string;
  production: number;
  totalDefects: number;
  [categoria: string]: number | string;
}

export interface DashboardData {
  meta: {
    totalProduction: number;
    totalDefects: number;
    ppmGeral: number | null;
    aiPrecision: number;
  };
  trendData: TrendHierarchy;
  topCauses: {
    byAnalysis: CauseItem[];
    byFailure: CauseItem[];
    byPosition: CauseItem[]; 
  };
  details: TurnoStats[];
  ppmMonthlyTrend: PpmMonthlyTrendItem[];
  responsabilidadeMensal: ResponsabilidadeMensalItem[];
  categoriaMensal: CategoriaMensalItem[];
  byCategory: any[];
  byModel: any[];
}

/* ======================================================
   HOOK PRINCIPAL
====================================================== */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ DATA DA ÚLTIMA ATUALIZAÇÃO
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { appliedFilters } = useDashboardFilters();

  // ✅ TRANSFORMEI O LOAD EM UM CALLBACK PARA PERMITIR REFRESH MANUAL
  const fetchData = useCallback(async (isSilent: boolean = false) => {
      try {
        if (!isSilent) setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // 1. FILTROS DE TEMPO
        const tipoPeriodo = appliedFilters.periodo.tipo as string;
        const { valor, ano, dia } = appliedFilters.periodo;

        if (tipoPeriodo === "mes" && valor && ano) {
          params.set("mes", valor.toString());
          params.set("ano", ano.toString());
        } 
        
        if (tipoPeriodo === "semana" && valor && ano) {
          params.set("semana", valor.toString());
          params.set("ano", ano.toString());
        }

        if (dia) {
          params.set("dia", dia);
        }

        // 2. FILTROS DE DIMENSÃO
        if (appliedFilters.categoria && appliedFilters.categoria !== "Todos") {
          params.set("categoria", appliedFilters.categoria);
        }
        if (appliedFilters.modelo && appliedFilters.modelo !== "Todos") {
          params.set("modelo", appliedFilters.modelo);
        }
        if (appliedFilters.turno && appliedFilters.turno !== "Todos") {
          params.set("turno", appliedFilters.turno);
        }
        
        if (appliedFilters.responsabilidade && appliedFilters.responsabilidade !== "Todos") {
          params.set("responsabilidade", appliedFilters.responsabilidade);
        }

        // Adiciona timestamp para evitar cache do browser
        params.set("t", Date.now().toString());

        // 3. REQUISIÇÃO AO BACKEND
        const res = await fetch(`/api/dashboard/summary?${params.toString()}`);
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Erro ao carregar dashboard");
        }

        const json: DashboardData = await res.json();
        setData(json);
        setLastUpdated(new Date()); // ✅ Atualiza timestamp
      } catch (err: any) {
        console.error("❌ Hook useDashboard Error:", err);
        if (!isSilent) setError(err?.message ?? "Erro desconhecido");
      } finally {
        if (!isSilent) setLoading(false);
      }
  }, [appliedFilters]);

  // Carrega ao montar ou mudar filtros
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return { 
      data, 
      loading, 
      error, 
      lastUpdated, // ✅ Exposto para exibir "Atualizado às..."
      refresh: () => fetchData(false), // ✅ Permite botão de refresh manual
      silentUpdate: () => fetchData(true) // ✅ Permite atualização sem loading (polling)
  };
}