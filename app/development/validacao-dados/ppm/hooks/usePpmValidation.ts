"use client";

import { useEffect, useMemo } from "react";
import { usePpmData } from "../../context/PpmContext";
import { useSigmaValidation } from "../../context/SigmaValidationProvider";

/* ============================================================
   HOOK — CONSUMO PURO (SEM FETCH)
============================================================ */

export function usePpmValidation() {
  const { data, loading, error } = usePpmData();
  const sigma = useSigmaValidation();

  /* ============================================================
     DADOS DERIVADOS (SE NECESSÁRIO)
  ============================================================ */

  const meta = data?.meta ?? null;
  const globalDiagnostics = data?.globalDiagnostics ?? [];
  const allRows = data?.allRows ?? [];
  const byCategory = data?.byCategory ?? {};

  /* ============================================================
     STATUS UNIFICADO
  ============================================================ */

  const isLoading = sigma.loading || loading;

  /* ============================================================
      🚨 ALERTA GLOBAL PARA A SIDEBAR PRINCIPAL
      Controla a animação de pulsação "neon" no menu global
  ============================================================ */
  useEffect(() => {
    // Só dispara se os dados já carregaram para não dar "falso positivo"
    if (data && !isLoading) {
      let hasIssues = false;
      
      // Contorno para o TypeScript: tratamos a variável como 'any' localmente 
      // para acessar com segurança seja ela um Array ou um Objeto.
      const diag = globalDiagnostics as any;

      if (Array.isArray(diag)) {
        // Se for array, checa se tem itens
        hasIssues = diag.length > 0;
      } else if (diag && typeof diag === "object") {
        // Se for objeto, checamos os contadores de inconsistências clássicas do PPM
        const err1 = Number(diag.defectsWithoutProduction || 0);
        const err2 = Number(diag.productionWithoutDefect || 0);
        
        hasIssues = err1 > 0 || err2 > 0;
      }

      if (hasIssues) {
        // Acende a flag específica do PPM
        localStorage.setItem("sigma_validation_alert_ppm", "true");
        window.dispatchEvent(new Event("sigma_alert_changed"));
      } else {
        // Apaga a flag se estiver tudo perfeito
        localStorage.removeItem("sigma_validation_alert_ppm");
        window.dispatchEvent(new Event("sigma_alert_changed"));
      }
    }
  }, [globalDiagnostics, data, isLoading]); // Removido o .length das dependências

  return {
    data,
    meta,
    globalDiagnostics,
    allRows,
    byCategory,

    loading: isLoading,
    error,
  };
}