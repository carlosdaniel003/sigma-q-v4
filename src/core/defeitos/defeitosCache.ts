import { loadDefeitosAll } from "./defeitosLoader";
import { enrichDefeito } from "./defeitosEnrichment";

type CacheStateData = {
  enriched: any[];
  [key: string]: any[]; // Isso permite chaves dinâmicas como 'TV', 'MWO', etc.
};

type CacheState = {
  carregado: boolean;
  carregando: boolean;
  dados: null | CacheStateData;
  optsKey?: string;
};

const cache: CacheState = {
  carregado: false,
  carregando: false,
  dados: null,
  optsKey: undefined,
};

export async function getDefeitosCache(catalogos: any = {}) {
  const flags = {
    usarCodigos: !!catalogos.usarCodigos,
    usarFalhas: !!catalogos.usarFalhas,
    usarResponsabilidades: !!catalogos.usarResponsabilidades,
  };

  const optsKey = JSON.stringify(flags);

  // 1. Se já carregou, retorna
  if (cache.carregado && cache.dados && cache.optsKey === optsKey) {
    return cache.dados;
  }

  // 2. Trava de carregamento
  if (cache.carregando && cache.optsKey === optsKey) {
    await waitForCache();
    return cache.dados!;
  }

  cache.carregando = true;
  cache.optsKey = optsKey;

  // 3. Busca os dados brutos do Loader
  const bases = await loadDefeitosAll(flags);
  const todosOsDados = bases.todas;

  // 4. Criamos o objeto de retorno dinâmico
  const dadosFinal: CacheStateData = {
    enriched: todosOsDados // A "Visão Geral"
  };

  // 5. Agrupamento por Categoria Real
  todosOsDados.forEach(item => {
    // Pega a categoria (ex: TV) e normaliza para ser a chave do objeto
    const cat = (item.CATEGORIA || item.categoria || "N/A").toUpperCase().trim();
    
    // Se a caixa "TV" não existe, criamos ela
    if (!dadosFinal[cat]) {
      dadosFinal[cat] = [];
    }
    
    // Coloca o registro dentro da caixa da categoria dele
    dadosFinal[cat].push(item);
  });

  cache.dados = dadosFinal;
  cache.carregando = false;
  cache.carregado = true;

  console.log("✅ Cache organizado por categorias:", Object.keys(dadosFinal).filter(k => k !== 'enriched'));

  return cache.dados;
}

function waitForCache(): Promise<void> {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (!cache.carregando && cache.carregado && cache.dados) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });
}