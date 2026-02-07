import React from "react";
import { DiagnosticoCardBase } from "./DiagnosticoCardBase";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface Props {
  data: InsightCard | null;
}

export function TopOfensorCard({ data }: Props) {
  // Este é o card que sempre aparece se os outros falharem
  return <DiagnosticoCardBase data={data} />;
}