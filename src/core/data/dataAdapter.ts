import { DefeitoRaw } from "./loadDefeitos";
import { DefeitoSQL } from "./types/SigmaSqlTypes"; // ✅ Importando Tipos
import {
  CAUSA_TRANSLATION,
  DEFEITO_TRANSLATION,
  RESPONSABILIDADE_TRANSLATION,
  TURNO_TRANSLATION,
  CODIGOS_OCORRENCIA
} from "./constants/sigmaTranslations"; // ✅ Importando Constantes

const API_URL = "http://10.110.100.227/qualitycontrol/SIGMA/teste_integracao/uploads/sigma_api.php";

// ======================================================
// 🔒 CACHE GLOBAL (COMPARTILHADO)
// ======================================================
let CACHE_MEMORIA: DefeitoRaw[] | null = null;
let ULTIMA_BUSCA = 0;
const TEMPO_CACHE_MS = 1000 * 60 * 5; // 5 Minutos de Cache

// ======================================================
// FUNÇÃO INTERNA: CARREGA E NORMALIZA TUDO (COM CACHE)
// ======================================================
async function _loadAllFromSQL(): Promise<DefeitoRaw[]> {
    const agora = Date.now();
    if (CACHE_MEMORIA && (agora - ULTIMA_BUSCA < TEMPO_CACHE_MS)) {
        // eslint-disable-next-line no-console
        console.log("⚡ [Adapter] Usando Cache de Memória (Sem ir ao PHP)");
        return CACHE_MEMORIA;
    }

    try {
        // eslint-disable-next-line no-console
        console.log("🌐 [Adapter] Buscando dados novos no servidor PHP...");
        
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro na API PHP: ${response.status} ${response.statusText}`);
        }

        const dadosSQL: DefeitoSQL[] = await response.json();

        if (!Array.isArray(dadosSQL)) {
            console.error("❌ Resposta da API não é um array:", dadosSQL);
            return [];
        }

        // eslint-disable-next-line no-console
        console.log(`📡 [Adapter] Total recebido da API: ${dadosSQL.length} registros.`);

        // Filtro Básico (PA)
        const dadosPA = dadosSQL.filter((item) => {
            const area = String(item.area || "").trim().toUpperCase();
            return area === "PA" || area === "PRODUTO ACABADO";
        });

        // Tradução e Mapeamento (Fazemos isso UMA vez para tudo)
        const dadosTraduzidos = dadosPA.map((sqlItem) => {
            const dataString = `${sqlItem.data_criacao}T12:00:00`;
            const dataObj = new Date(dataString);
            const mes = dataObj.toLocaleString("pt-BR", { month: "long" }).toUpperCase();

            const oneJan = new Date(dataObj.getFullYear(), 0, 1);
            const numberOfDays = Math.floor((dataObj.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
            const semana = Math.ceil((dataObj.getDay() + 1 + numberOfDays) / 7);

            const codigoCausa = String(sqlItem.causa || "").trim().toUpperCase();
            const causaTraduzida = CAUSA_TRANSLATION[codigoCausa] || codigoCausa; 

            const codigoDefeito = String(sqlItem.code_def || "").trim().toUpperCase();
            const defeitoTraduzido = DEFEITO_TRANSLATION[codigoDefeito] || codigoDefeito;

            const codigoResp = String(sqlItem.cod_mot || "").trim().toUpperCase();
            const respTraduzida = RESPONSABILIDADE_TRANSLATION[codigoResp] || codigoResp;

            const codigoTurno = String(sqlItem.turno || "").trim().toUpperCase();
            const turnoTraduzido = TURNO_TRANSLATION[codigoTurno] || codigoTurno;

            return {
                DATA: dataObj,
                MÊS: mes,
                SEMANA: semana,
                AREA: "PA", 
                TURNO: turnoTraduzido, 
                CÓDIGO: sqlItem.codigo_prod,
                MODELO: sqlItem.descricao_prod,
                CATEGORIA: sqlItem.categoria, 
                LINHA: sqlItem.linha,
                TÉCNICO: sqlItem.usuario,
                "CÓDIGO DA FALHA": sqlItem.code_def, 
                "DESCRIÇÃO DA FALHA": defeitoTraduzido, 
                "PEÇA/PLACA": sqlItem.desc_componente,
                "REFERÊNCIA/POSIÇÃO MECÂNICA": sqlItem.referencia,
                ANALISE: causaTraduzida, 
                QUANTIDADE: Number(sqlItem.qtd_df) || 1,
                "CÓDIGO DO FORNECEDOR": sqlItem.cod_mot,
                "CLASSIFICAÇÃO DO FORNECEDOR": "N/A",
                RESPONSABILIDADE: respTraduzida
            };
        });

        // Atualiza Cache
        CACHE_MEMORIA = dadosTraduzidos;
        ULTIMA_BUSCA = Date.now();

        return dadosTraduzidos;

    } catch (error) {
        console.error("🔥 Erro fatal no Adapter SQL:", error);
        if (CACHE_MEMORIA) return CACHE_MEMORIA;
        return [];
    }
}

// ======================================================
// 1️⃣ BUSCAR DEFEITOS (PARA KPI/PPM) - SEM OCORRÊNCIAS
// ======================================================
export async function fetchDefeitosFromSQL(): Promise<DefeitoRaw[]> {
    const todos = await _loadAllFromSQL();
    return todos.filter(item => {
        const codMot = String(item["CÓDIGO DO FORNECEDOR"] || "").trim().toUpperCase();
        return !CODIGOS_OCORRENCIA.includes(codMot);
    });
}

// ======================================================
// 2️⃣ ✅ BUSCAR OCORRÊNCIAS (PARA DETALHAMENTO)
// ======================================================
export async function fetchOcorrenciasFromSQL(): Promise<DefeitoRaw[]> {
    const todos = await _loadAllFromSQL();
    return todos.filter(item => {
        const codMot = String(item["CÓDIGO DO FORNECEDOR"] || "").trim().toUpperCase();
        return CODIGOS_OCORRENCIA.includes(codMot);
    });
}