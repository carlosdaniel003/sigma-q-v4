"use client";

import React from "react";

// ✅ 1. Importando os Componentes dos Pilares (CAMINHOS CORRIGIDOS)
// O caminho agora inclui ".../components/Diagnostico/pilares/..."
import { SpikeCard } from "../../../diagnostico/components/Diagnostico/pilares/SpikeCard";
import { MelhoriaCard } from "../../../diagnostico/components/Diagnostico/pilares/MelhoriaCard";
import { ReincidenciaCard } from "../../../diagnostico/components/Diagnostico/pilares/ReincidenciaCard";
import { ReboteCard } from "../../../diagnostico/components/Diagnostico/pilares/ReboteCard";
import { TopOfensorCard } from "../../../diagnostico/components/Diagnostico/pilares/TopOfensorCard";

// ✅ 2. Importando o tipo InsightCard para tipagem
import { InsightCard } from "../../../diagnostico/hooks/diagnosticoTypes";

// Definindo a interface do objeto 'dados' (os 5 pilares)
interface DiagnosticoPilaresData {
  spike: InsightCard | null;
  melhoria: InsightCard | null;
  reincidencia: InsightCard | null;
  rebote: InsightCard | null;
  topOfensor: InsightCard | null;
}

interface DiagnosticoAIProps {
  // O componente pode receber 'dados' contendo a estrutura dos pilares
  // OU pode receber o objeto 'pilares' direto, dependendo de como você passa do pai.
  dados: DiagnosticoPilaresData;
}

export function DiagnosticoAI({ dados }: DiagnosticoAIProps) {
  // Proteção básica
  if (!dados) return null;

  return (
    <div className="container-diagnostico-visual-padrao" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Cada Card já tem sua proteção interna (if !data return null),
          então podemos renderizar todos diretamente. 
      */}
      <SpikeCard data={dados.spike} />
      <MelhoriaCard data={dados.melhoria} />
      <ReincidenciaCard data={dados.reincidencia} />
      <ReboteCard data={dados.rebote} />
      <TopOfensorCard data={dados.topOfensor} />
    </div>
  );
}