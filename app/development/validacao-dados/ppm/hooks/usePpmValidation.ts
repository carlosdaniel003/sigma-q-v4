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
      let hasCriticalIssues = false;
      
      const diag = globalDiagnostics as any;

      if (Array.isArray(diag)) {
        // ✅ CORREÇÃO: Não basta ter itens (length > 0).
        // Tem que ter itens com status CRÍTICO ou ERRO.
        // Ignora "warning" (amarelo) e "info" (azul).
        hasCriticalIssues = diag.some(
            (d: any) => d.status === "error" || d.status === "critical"
        );
      } else if (diag && typeof diag === "object") {
        // Fallback para estrutura antiga (se houver)
        // Só considera erro se realmente impedir o cálculo
        const err1 = Number(diag.defectsWithoutProduction || 0);
        const err2 = Number(diag.productionWithoutDefect || 0);
        
        // Ajuste fino: Se a produção sem defeito for apenas um aviso, não alertar na sidebar
        // Aqui assumimos que se tem erro numérico, é crítico.
        hasCriticalIssues = err1 > 0; 
      }

      if (hasCriticalIssues) {
        // Acende a flag específica do PPM
        localStorage.setItem("sigma_validation_alert_ppm", "true");
      } else {
        // ✅ Apaga a flag se só tiver Warnings ou estiver perfeito
        localStorage.setItem("sigma_validation_alert_ppm", "false"); 
      }
      
      // Notifica a Sidebar para atualizar a cor imediatamente
      window.dispatchEvent(new Event("sigma_alert_changed"));
    }
  }, [globalDiagnostics, data, isLoading]);

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