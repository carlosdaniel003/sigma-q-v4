// ✅ Importamos o Adapter que busca do SQL
import { fetchDefeitosFromSQL } from "./dataAdapter";

/* ======================================================
   TIPAGEM: DefeitoRaw
   Contém os campos do Excel e os novos campos do SQL
   necessários para o Drawer de Detalhes.
====================================================== */
export interface DefeitoRaw {
  ID?: string | number;         // SQL
  DATA: any;                    // Excel/SQL
  HORA?: string;                // SQL
  MODELO: string;               // Excel/SQL
  CATEGORIA: string;            // Excel/SQL
  RESPONSABILIDADE: string;     // Excel/SQL
  TURNO: string;                // Excel/SQL
  ANALISE: string;              // Excel/SQL
  QUANTIDADE: number;           // Excel/SQL
  TÉCNICO?: string;             // SQL
  OBSERVACAO?: string;          // SQL
  CODIGO_MOTIVO?: string;       // SQL
  POSICAO_MECANICA?: string;    // SQL
  COMPONENTE?: string;          // SQL
  
  "CÓDIGO DA FALHA"?: string;   // Excel
  "DESCRIÇÃO DA FALHA"?: string; // Excel
  
  // ✅ CAMPO PARA OCORRÊNCIAS
  "CÓDIGO DO FORNECEDOR"?: string; // Excel/SQL

  // ✅ NOVO CAMPO: Posição Mecânica (Exatamente como no Excel)
  "REFERÊNCIA/POSIÇÃO MECÂNICA"?: string;
}

/**
 * Função principal para carregamento de dados.
 * ✅ VERSÃO SQL ONLY: Removemos qualquer dependência de Excel local.
 */
export async function loadDefeitos(includeOcorrencias: boolean = false): Promise<DefeitoRaw[]> {
  try {
    // 1. Tenta buscar do SQL (via Ponte PHP / dataAdapter)
    const dadosSQL = await fetchDefeitosFromSQL(undefined, includeOcorrencias);

    if (dadosSQL && dadosSQL.length > 0) {
      
      // ✅ HIGIENIZAÇÃO DE DADOS (Sanitization)
      // Filtra estornos/cancelamentos lógicos onde a quantidade foi zerada ou negativada no banco
      const dadosLimpos = dadosSQL.filter(item => {
        const qtd = Number(item.QUANTIDADE) || 0;
        return qtd > 0;
      });

      // eslint-disable-next-line no-console
      console.log(`📡 [LoadDefeitos] SQL Conectado (Bruto: ${dadosSQL.length} | Limpos: ${dadosLimpos.length} - Ocorrências: ${includeOcorrencias ? 'ON' : 'OFF'})`);
      
      return dadosLimpos;
    } else {
      console.warn("⚠️ [LoadDefeitos] SQL retornou lista vazia.");
      return [];
    }
  } catch (err) {
    // Se der erro no SQL, apenas logamos e retornamos vazio para não derrubar o servidor
    console.error("❌ [LoadDefeitos] Erro crítico ao consultar API SQL:", err);
    return [];
  }
}