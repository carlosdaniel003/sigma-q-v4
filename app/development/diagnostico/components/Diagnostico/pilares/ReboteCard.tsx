import React from "react";
import { DiagnosticoCardBase } from "./DiagnosticoCardBase";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface Props {
  data: InsightCard | null;
}

export function ReboteCard({ data }: Props) {
  return <DiagnosticoCardBase data={data} />;
}