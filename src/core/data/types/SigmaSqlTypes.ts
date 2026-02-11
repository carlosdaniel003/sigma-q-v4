// src/core/data/types/SigmaSqlTypes.ts

// Interface exata do JSON que vem do PHP
export interface DefeitoSQL {
  id: string;
  area: string;
  categoria: string;
  codigo_prod: string;
  descricao_prod: string;
  turno: string;
  linha: string;
  code_def: string;
  cod_componente: string;
  desc_componente: string;
  referencia: string;
  causa: string;
  cod_mot: string;
  qtd_df: string;
  data_criacao: string;
  hora_criacao: string;
  usuario: string;
}