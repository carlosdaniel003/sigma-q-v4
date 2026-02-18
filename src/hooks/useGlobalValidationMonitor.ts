"use client";

import { useEffect } from "react";

/**
 * Hook Global que verifica silenciosamente o status das validações
 * ao carregar a aplicação, atualizando os alertas da Sidebar.
 */
export function useGlobalValidationMonitor() {
  useEffect(() => {
    let isMounted = true;

    const checkAllValidations = async () => {
      // eslint-disable-next-line no-console
      console.log("🔍 [Monitor] Verificando integridade das bases...");

      // Variáveis de estado locais para salvar no final
      let alertDefeitos = false;
      let alertProducao = false;
      let alertPpm = false;

      // ============================================================
      // 1. CHECA DEFEITOS (Olhando KPI Global AI)
      // ============================================================
      try {
        const resDef = await fetch("/api/diagnostico/filtros?t=" + Date.now());
        if (resDef.ok) {
            const dataDef = await resDef.json();
            
            // ✅ CORREÇÃO: Olha para o KPI Geral (aiOverall)
            // Se o percentual identificado for menor que 100%, ATIVA O ALERTA.
            const globalPct = Number(dataDef.aiOverall?.percentIdentified || 0);
            
            // Consideramos erro se for menor que 99.9% (pra evitar dizima periodica 99.999)
            if (globalPct < 99.9) {
                alertDefeitos = true;
            }
        }
      } catch (e) {
        console.warn("⚠️ [Monitor] Erro ao checar Defeitos:", e);
      }

      // ============================================================
      // 2. CHECA PRODUÇÃO
      // ============================================================
      try {
        const resProd = await fetch("/api/producao/validate?t=" + Date.now());
        if (resProd.ok) {
            const dataProd = await resProd.json();
            // Se houver linhas inválidas > 0, alerta.
            if ((dataProd.meta?.invalidLines || 0) > 0) {
                alertProducao = true;
            }
        }
      } catch (e) {
        console.warn("⚠️ [Monitor] Erro ao checar Produção:", e);
      }

      // ============================================================
      // 3. CHECA PPM (Com proteção contra Crash)
      // ============================================================
      try {
        const resPpm = await fetch("/api/ppm/validate?t=" + Date.now());
        if (resPpm.ok) {
            const dataPpm = await resPpm.json();
            
            // ✅ PROTEÇÃO: Garante que é array antes de ler
            const diagnostics = Array.isArray(dataPpm.diagnostics) ? dataPpm.diagnostics : [];
            
            // Se o usuário diz que o KPI é 100%, não deve haver 'critical'.
            // Validamos apenas erros CRÍTICOS que impediriam o cálculo.
            if (diagnostics.length > 0) {
                 const hasCritical = diagnostics.some((d: any) => d.status === "critical");
                 if (hasCritical) {
                     alertPpm = true;
                 }
            }
        }
      } catch (e) {
        console.warn("⚠️ [Monitor] Erro ao checar PPM:", e);
      }

      // ============================================================
      // SALVAR E DISPARAR EVENTO
      // ============================================================
      localStorage.setItem("sigma_validation_alert", String(alertDefeitos));
      localStorage.setItem("sigma_validation_alert_producao", String(alertProducao));
      localStorage.setItem("sigma_validation_alert_ppm", String(alertPpm));

      if (isMounted) {
        window.dispatchEvent(new Event("sigma_alert_changed"));
        // eslint-disable-next-line no-console
        console.log("✅ [Monitor] Status atualizado:", { 
            defeitos: alertDefeitos ? "🔴 ALERTA (<100%)" : "🟢 OK", 
            producao: alertProducao ? "🔴 ALERTA" : "🟢 OK", 
            ppm: alertPpm ? "🔴 ALERTA" : "🟢 OK" 
        });
      }
    };

    // Executa 2 segundos após montar
    const timer = setTimeout(() => {
      checkAllValidations();
    }, 2000);

    return () => {
        isMounted = false;
        clearTimeout(timer);
    };
  }, []);
}