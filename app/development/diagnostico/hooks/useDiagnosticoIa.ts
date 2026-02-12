"use client";

import { useEffect, useState } from "react";
import { useDiagnosticoFilters } from "../store/diagnosticoFilters";
import { DiagnosticoIaResponse } from "./diagnosticoTypes";

/* ======================================================
   HOOK — DIAGNÓSTICO IA
====================================================== */
export function useDiagnosticoIa() {
  const { filters } = useDiagnosticoFilters();

  const [data, setData] = useState<DiagnosticoIaResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ======================================================
     FETCH CONTROLADO (APÓS "BUSCAR")
  ====================================================== */
  useEffect(() => {
    // ⛔ período obrigatório
    if (
      !filters.periodo ||
      filters.periodo.valor === null ||
      filters.periodo.ano === null
    ) {
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        /* ======================================================
           QUERY STRING — CONTRATO ÚNICO
        ====================================================== */
        const params = new URLSearchParams();

        params.set("periodoTipo", filters.periodo.tipo);
        params.set("periodoValor", String(filters.periodo.valor));
        params.set("ano", String(filters.periodo.ano));

        if (filters.modelo) {
          params.set("modelo", filters.modelo);
        }

        if (filters.categoria) {
          params.set("categoria", filters.categoria);
        }

        // ✅ Passa a string do filtro (ex: "AGRUPAMENTO DE PROCESSOS") para a API.
        // A API usará o DataAdapter atualizado para interpretar isso corretamente.
        if (filters.responsabilidade) {
          params.set("responsabilidade", filters.responsabilidade);
        }

        if (filters.turno) {
          params.set("turno", filters.turno);
        }

        const res = await fetch(
          `/api/diagnostico/summary?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error("Erro ao carregar diagnóstico de IA");
        }

        const json: DiagnosticoIaResponse = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [filters]);

  return {
    data,
    loading,
    error,
    filters,
  };
}