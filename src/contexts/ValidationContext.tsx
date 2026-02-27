"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Tipagem dos nossos alertas
interface ValidationAlerts {
  defeitos: boolean;
  producao: boolean;
  ppm: boolean;
}

interface ValidationContextProps {
  alerts: ValidationAlerts;
  checkAllValidations: () => Promise<void>; 
}

const ValidationContext = createContext<ValidationContextProps | undefined>(undefined);

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<ValidationAlerts>({
    defeitos: false,
    producao: false,
    ppm: false,
  });

  const checkAllValidations = async () => {
    let alertDefeitos = false;
    let alertProducao = false;
    let alertPpm = false;

    const fetchOpts: RequestInit = { 
      cache: "no-store", 
      headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" } 
    };
    const ts = Date.now();

    try {
      // Bate nas 3 APIs em paralelo
      const [resDef, resProd, resPpm] = await Promise.allSettled([
        fetch(`/api/diagnostico/filtros?t=${ts}`, fetchOpts),
        fetch(`/api/producao/validate?t=${ts}`, fetchOpts),
        fetch(`/api/ppm/validate?t=${ts}`, fetchOpts)
      ]);

      // ============================================================
      // 1. DEFEITOS
      // ============================================================
      if (resDef.status === "fulfilled" && resDef.value.ok) {
        const data = await resDef.value.json();
        if (Number(data.aiOverall?.percentIdentified || 0) < 99.9) alertDefeitos = true;
      }

      // ============================================================
      // 2. PRODUÇÃO
      // ============================================================
      if (resProd.status === "fulfilled" && resProd.value.ok) {
        const data = await resProd.value.json();
        if (data.ok) {
          const matchRateVol = Number(data.totals?.matchRateByVolume || 0);
          const matchRateRows = Number(data.totals?.matchRateByRows || 0);
          const naoIdentificados = Number(data.totals?.notIdentifiedVolume || 0);
          if (matchRateVol < 99.9 || matchRateRows < 99.9 || naoIdentificados > 0) alertProducao = true;
        }
      }

      // ============================================================
      // 3. PPM (DETETIVE RECURSIVO)
      // ============================================================
      if (resPpm.status === "fulfilled" && resPpm.value.ok) {
        const dataPpm = await resPpm.value.json();
        
        let allRows: any[] = [];
        
        // Função que escava qualquer objeto até achar a lista do PPM
        const findArray = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (Array.isArray(val)) {
              // Se achou uma lista, e o primeiro item da lista tem as propriedades do PPM, CAPTUROU!
              if (val.length > 0 && (val[0].hasOwnProperty('validationStatus') || val[0].hasOwnProperty('produzido'))) {
                allRows = val;
                return;
              }
            } else if (typeof val === 'object') {
              findArray(val); // Procura mais fundo
            }
          }
        };

        // Começa a busca
        if (Array.isArray(dataPpm)) {
            if (dataPpm.length > 0 && dataPpm[0].hasOwnProperty('produzido')) allRows = dataPpm;
        } else {
            findArray(dataPpm);
        }

        const total = allRows.length;
        
        // Conta os válidos 
        const validos = allRows.filter((r: any) => 
          r.validationStatus === "VALID" || r.validationStatus === "valid"
        ).length;

        const precisaoPpm = total > 0 ? Math.round((validos / total) * 100) : 100;
        
        // Conta os itens órfãos
        const itensSemProducao = allRows.filter((r: any) => 
          (r.produzido === 0 || !r.produzido) && r.defeitos > 0
        ).length;

        // Logs para garantir que encontrou
        // eslint-disable-next-line no-console
        console.log(`📊 [Monitor Contexto] PPM API ROOT KEYS:`, Object.keys(dataPpm));
        // eslint-disable-next-line no-console
        console.log(`📊 [Monitor Contexto] PPM -> Total Encontrado: ${total} | Válidos: ${validos} | Precisão: ${precisaoPpm}% | Órfãos: ${itensSemProducao}`);

        // A Matemática Absoluta para acender o Alerta
        if (precisaoPpm < 100 || (total > 0 && validos < total) || itensSemProducao > 0) {
           alertPpm = true;
        }
      }

      // ATUALIZA O ESTADO IMEDIATAMENTE PARA TODO O SISTEMA
      setAlerts({ defeitos: alertDefeitos, producao: alertProducao, ppm: alertPpm });
      
    } catch (error) {
      console.error("⚠️ [Contexto Global] Erro na varredura:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => checkAllValidations(), 2000);
    const interval = setInterval(() => checkAllValidations(), 300000); // 5 min
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return (
    <ValidationContext.Provider value={{ alerts, checkAllValidations }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error("useValidation tem de ser usado dentro de um ValidationProvider");
  }
  return context;
}