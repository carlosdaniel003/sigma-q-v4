"use client";
import { useState, useEffect } from "react";

export function useCatalogo() {
  const [todosModelos, setTodosModelos] = useState([]);
  const [todasCausas, setTodasCausas] = useState([]);
  const [todasResp, setTodasResp] = useState([]);
  const [todosDefeitos, setTodosDefeitos] = useState([]);
  const [todosFMEA, setTodosFMEA] = useState([]);
  const [todasExcessoes, setTodasExcessoes] = useState([]);
  // ✅ NOVO ESTADO: Agrupamentos
  const [todosAgrupamentos, setTodosAgrupamentos] = useState([]);

  const [buscaGlobal, setBuscaGlobal] = useState("");
  const [catalogo, setCatalogo] = useState("");
  const [dados, setDados] = useState([]);

  // =======================
  //  CARREGAR TODAS AS BASES
  // =======================
  useEffect(() => {
    const fetchSafe = (url: string) =>
      fetch(url)
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);

    async function carregarTudo() {
      // ✅ Adicionado fetch para /api/catalogo/agrupamento
      const [m, c, r, d, fmea, exc, agr] = await Promise.all([
        fetchSafe("/api/catalogo/modelos"),
        fetchSafe("/api/catalogo/causas"),
        fetchSafe("/api/catalogo/responsabilidades"),
        fetchSafe("/api/catalogo/defeitos"),
        fetchSafe("/api/catalogo/fmea"),
        fetchSafe("/api/catalogo/excecoes"),
        fetchSafe("/api/catalogo/agrupamento"), 
      ]);

      setTodosModelos(m);
      setTodasCausas(c);
      setTodasResp(r);
      setTodosDefeitos(d);
      setTodosFMEA(fmea);   
      setTodasExcessoes(exc);
      setTodosAgrupamentos(agr); // ✅ Salva no estado
    }

    carregarTudo();
  }, []);

  // ==========================
  //  NAVEGAÇÃO ENTRE CATÁLOGOS
  // ==========================
  function carregarCatalogo(tipo: string) {
    setCatalogo(tipo);
    setBuscaGlobal("");

    const bases: any = {
      modelos: todosModelos,
      causas: todasCausas,
      responsabilidades: todasResp,
      defeitos: todosDefeitos,
      fmea: todosFMEA,       
      excecoes: todasExcessoes,
      agrupamentos: todosAgrupamentos, // ✅ Adicionado ao mapa de navegação
    };

    setDados(bases[tipo] || []);
  }

  // ======================
  //  BUSCA GLOBAL
  // ======================
  function filtrar(lista: any[]) {
    if (!buscaGlobal.trim()) return [];
    return lista.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(buscaGlobal.toLowerCase())
    );
  }

  const resultadosBusca = {
    modelos: filtrar(todosModelos),
    causas: filtrar(todasCausas),
    responsabilidades: filtrar(todasResp),
    defeitos: filtrar(todosDefeitos),
    fmea: filtrar(todosFMEA),   
    excecoes: filtrar(todasExcessoes),
    agrupamentos: filtrar(todosAgrupamentos), // ✅ Adicionado à busca global
  };

  const temBusca = buscaGlobal.trim().length > 0;

  return {
    buscaGlobal,
    setBuscaGlobal,
    catalogo,
    dados,
    resultadosBusca,
    temBusca,
    carregarCatalogo,
  };
}