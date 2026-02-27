export const dynamic = "force-dynamic";

export interface ProducaoRaw {
  DATA: any;
  MODELO: string;
  CATEGORIA: string;
  TURNO: string; 
  QTY_GERAL: number;
  // ✅ Novas colunas adicionadas
  TIPO_MOV: string;
  FABRICA: string;
  TIPO_PROD: string;
  MATNR: string;
}

const API_PRODUCAO_URL = "http://10.110.100.227/qualitycontrol/SIGMA/teste_integracao/uploads/sigma_producao_api.php";

// Cache global em memória para não sobrecarregar o banco de dados
let CACHE_PRODUCAO: ProducaoRaw[] | null = null;
let ULTIMA_BUSCA = 0;
const TEMPO_CACHE_MS = 0; // 0 para leitura em tempo real sempre

/* ======================================================
   🧠 INFERÊNCIA INTELIGENTE DE CATEGORIA
   Baseado na lista oficial de conversão.
====================================================== */
function inferirCategoria(modelo: string, fallbackCategoriaBruta: string): string {
  const m = String(modelo).toUpperCase();

  // 1. Regras Exatas solicitadas (Mapeamento Oficial)
  if (m.includes("TM-1200")) return "TM";
  if (m.includes("AWS-BBS") || m.includes("BBS-01") || m.includes("BOOMBOX")) return "BBS";
  if (m.includes("CM-1000") || m.includes("CM-300") || m.includes("CM-650") || m.includes("CAIXA AMPLIFICADA CM")) return "CM";
  if (m.includes("MO-01") || m.includes("MO-02") || m.includes("MICRO-ONDAS") || m.includes("MICRO ONDAS")) return "MWO";
  // ✅ Ajustado para apanhar tanto a T1W como a T2W
  if (m.includes("AWS-T2W") || m.includes("T2W-02") || m.includes("AWS-T1W") || m.includes("T1W-02") || m.includes("TORRE DE SOM AWS-T")) return "TW";

  // 2. Fallbacks de Segurança (Caso entrem modelos novos no futuro)
  if (m.includes("TV") || m.includes("TELEVISOR")) return "TV";
  if (m.includes("AR CONDICIONADO") || m.includes("SPLIT") || m.includes("CONDENSADOR") || m.includes("EVAPORADOR")) return "ARCON";
  if (m.includes("PLACA") || m.includes("PCI") || m.includes("PCBA")) return "HW";

  // 🚨 Fallback final: Devolve a categoria bruta recebida, mas se não houver, fica em branco. 
  // Nunca mais utiliza o "TIPO_PROD" ou "OUTROS".
  return String(fallbackCategoriaBruta || "").trim().toUpperCase();
}

/* ======================================================
   ⏰ INFERÊNCIA INTELIGENTE DE TURNO (COM MINUTOS)
   Baseado no horário (HORA) vindo do SQL.
====================================================== */
function inferirTurno(horaStr: string): string {
  if (!horaStr || horaStr === "00:00:00" || horaStr.trim() === "") {
     return "C"; // Fallback de segurança se a hora vier zerada no SAP
  }

  // Extrai horas e minutos do formato "14:30:00"
  const partes = horaStr.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);

  if (isNaN(horas) || isNaN(minutos)) return "C";

  // Converte o horário do SAP para o "Minuto do Dia" (0 a 1440)
  const minutoDoDia = (horas * 60) + minutos;

  // Fronteiras do Turno Comercial:
  // Início: 06:45 -> (6 * 60) + 45 = 405
  // Fim: 16:45 -> (16 * 60) + 45 = 1005 (Até 16:44 pertence ao Comercial)
  
  const INICIO_COMERCIAL = 405; // 06:45
  const FIM_COMERCIAL = 1005;   // 16:45

  if (minutoDoDia >= INICIO_COMERCIAL && minutoDoDia < FIM_COMERCIAL) {
      return "C"; 
  } else {
      return "2"; 
  }
}

export async function loadProducao(): Promise<ProducaoRaw[]> {
  const agora = Date.now();
  
  if (CACHE_PRODUCAO && (agora - ULTIMA_BUSCA < TEMPO_CACHE_MS)) {
      return CACHE_PRODUCAO;
  }

  try {
    const urlComBuster = `${API_PRODUCAO_URL}?t=${agora}`;
    const response = await fetch(urlComBuster, {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
        }
    });

    if (!response.ok) {
        throw new Error(`Erro na API PHP de Produção: ${response.status}`);
    }

    const rawData: any[] = await response.json();

    if (!Array.isArray(rawData)) {
        console.error("❌ Resposta da API de produção não é um array:", rawData);
        return [];
    }

    // 🛡️ FILTRO DE ANO 2026 E TRATAMENTO DE DATA
    const filteredData = rawData.filter((r) => {
      let dataObj: Date | null = null;

      if (r.DATA) {
         const dateStr = String(r.DATA).trim().split(" ")[0];
         dataObj = new Date(`${dateStr}T12:00:00`); 
      }

      if (!dataObj || isNaN(dataObj.getTime())) return false;
      return dataObj.getFullYear() === 2026;
    });

    const discarded = rawData.length - filteredData.length;
    if (discarded > 0) {
        // eslint-disable-next-line no-console
        console.log(`🧹 [LoadProducao] ${discarded} registros ignorados. Mantidos: ${filteredData.length} (2026).`);
    }

    // ======================================================
    // 🧠 DE-PARA: COLUNAS SQL (SAP) -> CONTRATO SIGMA-Q
    // ======================================================
    const dadosMapeados: ProducaoRaw[] = filteredData.map((r) => {
      
      let rawQtd = String(r.QUANTIDADE || "0").trim();
      if (rawQtd.includes(",")) {
          rawQtd = rawQtd.replace(/\./g, "").replace(",", ".");
      }
      let qtdReal = Number(rawQtd);
      if (isNaN(qtdReal)) qtdReal = 0;

      const modeloNome = String(r.MAKTX || "").trim().toUpperCase();
      const dateStr = String(r.DATA).trim().split(" ")[0];
      const horaStr = String(r.HORA || "").trim();
      
      const turnoCalculado = inferirTurno(horaStr);

      return {
        DATA: new Date(`${dateStr}T12:00:00`), 
        MODELO: modeloNome,
        // ✅ Categoria passa a receber apenas o nome do modelo e uma eventual categoria pré-existente
        CATEGORIA: inferirCategoria(modeloNome, r.CATEGORIA), 
        TURNO: turnoCalculado, 
        QTY_GERAL: qtdReal,
        // ✅ Trazendo as novas colunas
        TIPO_MOV: String(r.TIPO_MOV || "").trim(),
        FABRICA: String(r.FABRICA || "").trim(),
        TIPO_PROD: String(r.TIPO_PROD || "").trim(),
        MATNR: String(r.MATNR || "").trim(),
      };
    });

    CACHE_PRODUCAO = dadosMapeados;
    ULTIMA_BUSCA = Date.now();

    return dadosMapeados;

  } catch (error) {
    console.error("❌ Erro ao carregar produção do SQL:", error);
    if (CACHE_PRODUCAO) return CACHE_PRODUCAO; 
    return [];
  }
}