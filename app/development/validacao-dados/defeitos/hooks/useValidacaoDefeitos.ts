"use client";

import { useEffect, useRef, useState } from "react";
import { useDefectsData } from "../../context/DefectsContext";

/* -------------------------------------------------------
   TIPOS OFICIAIS (Agora genéricos para suportar SQL dinâmico)
------------------------------------------------------- */
export type Fonte = string; // Antes era Union Type fixo, agora aceita qualquer Categoria
export type FonteFiltro = string;

interface LogEntry {
  ts: string;
  msg: string;
  type: "info" | "success" | "error" | "process";
}

/* -------------------------------------------------------
   HOOK PRINCIPAL — SOMENTE CONSUMO
------------------------------------------------------- */
export default function useValidacaoDefeitos() {
  /* -----------------------------------------
      CONTEXTO — FONTE ÚNICA DA VERDADE
   ----------------------------------------- */
  // diag aqui vem BRUTO do backend (todas as inconsistências)
  const { stats, diag } = useDefectsData();

  /* -----------------------------------------
      ESTADOS DE UI
   ----------------------------------------- */
  const [fonte, setFonte] = useState<Fonte>("todas");
  const [diagFilter, setDiagFilter] = useState<FonteFiltro>("todas");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const mounted = useRef(true);

  /* -----------------------------------------
      LOGGER
   ----------------------------------------- */
  const addLog = (msg: string, type: LogEntry["type"] = "info") => {
    if (!mounted.current) return;

    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prev) => [...prev, { ts, msg, type }]);
  };

  /* -----------------------------------------
      STATUS DE CARGA
   ----------------------------------------- */
  useEffect(() => {
    mounted.current = true;

    if (stats && stats.totalItems > 0) {
      addLog(
        `Validação concluída (${stats.totalItems.toLocaleString()} registros analisados)`,
        "success"
      );
    } else {
      addLog("Aguardando dados de validação do backend…", "process");
    }

    return () => {
      mounted.current = false;
    };
  }, [stats]);

  /* -----------------------------------------
      KPIs — 100% BACKEND
   ----------------------------------------- */
  const total = stats?.totalItems ?? 0;
  const totalDefeitos = stats?.totalDefeitos ?? 0;
  const notIdentified = stats?.notIdentified ?? 0;
  const aiOverall = stats?.percentIdentified ?? 0;
  const perBase = stats?.perBase ?? {};
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* -----------------------------------------
      🔑 FILTRO POR CATEGORIA (SIDEBAR)
      → Sidebar define a "fonte" (que agora é a Categoria: TV, CM, etc)
      → Aqui filtramos o array de diagnósticos
   ----------------------------------------- */
  const diagByFonte = (() => {
    if (!Array.isArray(diag)) return [];

    // 1. Se for "todas", retorna tudo sem filtrar
    if (fonte === "todas") return diag;

    // 2. Filtro Inteligente por Categoria
    // CORREÇÃO CRÍTICA: A API devolve a categoria do produto (TV, CM) na propriedade 'fonte'.
    // A propriedade 'categoria' contém o TIPO do erro (ex: 'falhas', 'modelos').
    // Portanto, devemos comparar a seleção da sidebar apenas com 'd.fonte'.
    return diag.filter((d: any) => {
        // Normaliza o item que veio da API (Pega a Categoria do Produto)
        const itemProductCat = String(d.fonte || d.CATEGORIA || "").toUpperCase().trim();
        
        // Normaliza o que foi selecionado na Sidebar
        const selectedCat = fonte.toUpperCase().trim();

        return itemProductCat === selectedCat;
    });
  })();

  /* -----------------------------------------
      EXPORTAÇÃO
   ----------------------------------------- */
  return {
    // filtros
    fonte,
    setFonte,

    diagFilter,
    setDiagFilter,

    // dados OFICIAIS
    stats,

    // ✅ DIAGNÓSTICO FILTRADO POR CATEGORIA CORRETAMENTE
    diag: diagByFonte,

    // logs
    logs,

    // KPIs
    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  };
}