  import React from "react";
import { CheckCircle } from "lucide-react"; // Exemplo: Ícone específico
import { DiagnosticoCardBase } from "./DiagnosticoCardBase";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface Props {
  data: InsightCard | null;
}

export function MelhoriaCard({ data }: Props) {
  // Exemplo: Passando um ícone customizado só para melhoria
  return <DiagnosticoCardBase data={data} customIcon={CheckCircle} />;
}