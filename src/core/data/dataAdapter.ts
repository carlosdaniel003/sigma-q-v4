import { DefeitoRaw } from "./loadDefeitos";
// import { DefeitoSQL } from "./types/SigmaSqlTypes"; 
import {
  CAUSA_TRANSLATION,
  DEFEITO_TRANSLATION,
  RESPONSABILIDADE_TRANSLATION,
  TURNO_TRANSLATION,
  CODIGOS_OCORRENCIA
} from "./constants/sigmaTranslations"; 

const API_URL = "http://10.110.100.227/qualitycontrol/SIGMA/teste_integracao/uploads/sigma_api.php";

// ======================================================
// 🔒 CACHE GLOBAL
// ======================================================
let CACHE_MEMORIA: DefeitoRaw[] | null = null;
let ULTIMA_BUSCA = 0;
const TEMPO_CACHE_MS = 1000 * 60 * 5; 

// ======================================================
// 🧠 HELPER: NORMALIZAÇÃO CANÔNICA
// ======================================================
function normalizeResponsibilityName(raw: string, codMot: string = ""): string {
    const v = (raw || "").trim().toUpperCase();
    const cod = codMot.trim().toUpperCase();

    // ❌ REMOVIDO: Não forçamos mais o nome "OCORRÊNCIA" aqui.
    // Queremos saber de onde veio (Processo, Fornecedor, etc).
    // if (CODIGOS_OCORRENCIA.includes(cod)) { return "OCORRÊNCIA"; }

    // ✅ 1. REGRA EXCLUSIVA: DIP PTH
    if (cod === "DP" || v.includes("DIP") || v === "DP") {
        return "DIP PTH";
    }

    if (!v) return "N/A";

    // 2. FORNECEDORES
    if (v === "F" || v.includes("IMPORTADO") || v.includes("IMP")) return "FORNECEDOR IMPORTADO";
    if (v === "FL" || (v.includes("LOCAL") && (v.includes("FORN") || v.includes("FORNECEDOR")))) return "FORNECEDOR LOCAL";

    // 3. PROCESSOS (Mapeamento Rígido)
    if (v.includes("PTH")) return "PROCESSO PTH";
    if (v.includes("INJE") || v.includes("INJEÇÃO")) return "PROCESSO INJEÇÃO";
    if (v.includes("LCM")) return "PROCESSO LCM";
    if (v === "PROCESSO MA" || v.includes(" MA ")) return "PROCESSO MA"; 
    if (v.includes("ALTO FALANTE") || v.includes("ALTO-FALANTE")) return "PROC. ALTO FALANTE";
    if (v.includes("ENG") || v.includes("PROJETO") || v.includes("JIG")) return "ENGENHARIA/PROJETO";

    // 4. FALLBACKS
    if (v.startsWith("PROC") || v === "P") {
        return "PROCESSO PA";
    }
    
    // Se for ocorrência e não caiu em nada acima, pode manter o nome original ou agrupar
    return v;
}

// ======================================================
// 🧠 LÓGICA DE GRUPOS INTELIGENTES
// ======================================================
function matchResponsabilidade(itemValue: string, filtro: string): boolean {
    if (!filtro || filtro === "Todos") return true;

    const val = itemValue.toUpperCase().trim();
    const filter = filtro.toUpperCase().trim();

    if (filter === "AGRUPAMENTO DE PROCESSOS") {
        return val.startsWith("PROC"); 
    }

    if (filter === "AGRUPAMENTO DE FORNECEDORES") {
        return val.startsWith("FORN"); 
    }

    return val === filter;
}

// ======================================================
// FUNÇÃO INTERNA: CARREGA E NORMALIZA TUDO
// ======================================================
async function _loadAllFromSQL(): Promise<DefeitoRaw[]> {
    const agora = Date.now();
    if (CACHE_MEMORIA && (agora - ULTIMA_BUSCA < TEMPO_CACHE_MS)) {
        return CACHE_MEMORIA;
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro na API PHP: ${response.status} ${response.statusText}`);
        }

        const dadosSQL: any[] = await response.json();

        if (!Array.isArray(dadosSQL)) {
            console.error("❌ Resposta da API não é um array:", dadosSQL);
            return [];
        }

        const dadosPA = dadosSQL.filter((item) => {
            const area = String(item.area || "").trim().toUpperCase();
            return area === "PA" || area === "PRODUTO ACABADO";
        });

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
            let respTraduzida = RESPONSABILIDADE_TRANSLATION[codigoResp] || codigoResp;
            
            // ✅ Normalização (Agora preserva o nome do processo mesmo se for ocorrência)
            respTraduzida = normalizeResponsibilityName(respTraduzida, codigoResp);

            const codigoTurno = String(sqlItem.turno || "").trim().toUpperCase();
            const turnoTraduzido = TURNO_TRANSLATION[codigoTurno] || codigoTurno;

            return {
                ID: sqlItem.id,
                DATA: dataObj,
                MÊS: mes,
                SEMANA: semana,
                AREA: "PA", 
                TURNO: turnoTraduzido, 
                CÓDIGO: sqlItem.codigo_prod,
                MODELO: sqlItem.descricao_prod,
                CATEGORIA: sqlItem.categoria, 
                LINHA: sqlItem.linha,
                
                HORA: sqlItem.hora_criacao || "--:--",
                TÉCNICO: sqlItem.usuario || "N/A",
                OBSERVACAO: sqlItem.obs || "",
                CODIGO_MOTIVO: sqlItem.cod_mot || "N/A",
                POSICAO_MECANICA: sqlItem.referencia || "N/A",
                
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

        CACHE_MEMORIA = dadosTraduzidos;
        ULTIMA_BUSCA = Date.now();

        return dadosTraduzidos;

    } catch (error) {
        console.error("🔥 Erro fatal no Adapter SQL:", error);
        if (CACHE_MEMORIA) return CACHE_MEMORIA;
        return [];
    }
}

export async function fetchDefeitosFromSQL(
    filtroResponsabilidade?: string, 
    includeOcorrencias: boolean = false
): Promise<DefeitoRaw[]> {
    
    const todos = await _loadAllFromSQL();
    
    return todos.filter(item => {
        if (!includeOcorrencias) {
            const codMot = String(item["CÓDIGO DO FORNECEDOR"] || "").trim().toUpperCase();
            if (CODIGOS_OCORRENCIA.includes(codMot)) return false; 
        }

        if (filtroResponsabilidade && filtroResponsabilidade !== "Todos") {
            return matchResponsabilidade(item.RESPONSABILIDADE, filtroResponsabilidade);
        }

        return true;
    });
}

export async function fetchOcorrenciasFromSQL(filtroResponsabilidade?: string): Promise<DefeitoRaw[]> {
    const todos = await _loadAllFromSQL();
    
    return todos.filter(item => {
        const codMot = String(item["CÓDIGO DO FORNECEDOR"] || "").trim().toUpperCase();
        if (!CODIGOS_OCORRENCIA.includes(codMot)) return false;

        if (filtroResponsabilidade && filtroResponsabilidade !== "Todos") {
            return matchResponsabilidade(item.RESPONSABILIDADE, filtroResponsabilidade);
        }

        return true;
    });
}