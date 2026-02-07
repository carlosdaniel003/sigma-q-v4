import React from "react";
import { DiagnosticoCardBase } from "./DiagnosticoCardBase";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface Props {
  data: InsightCard | null;
}

export function SpikeCard({ data }: Props) {
  // Futuramente: Adicionar mini-gráfico de linha aqui
  return <DiagnosticoCardBase data={data} />;
}