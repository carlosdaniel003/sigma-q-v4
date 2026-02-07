import React from "react";
import { DiagnosticoCardBase } from "./DiagnosticoCardBase";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface Props {
  data: InsightCard | null;
}

export function ReincidenciaCard({ data }: Props) {
  // Futuramente: Mostrar lista dos meses anteriores que falharam
  return <DiagnosticoCardBase data={data} />;
}