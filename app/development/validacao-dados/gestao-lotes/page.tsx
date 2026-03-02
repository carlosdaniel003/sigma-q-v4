"use client";

import React, { useState, useEffect, useMemo } from "react";
import { inferirCategoria } from "./utils/inferirCategoria";

import GestaoLotesHeader from "./components/GestaoLotesHeader";
import GestaoLotesFiltros from "./components/GestaoLotesFiltros";
import GestaoLotesTabela from "./components/GestaoLotesTabela";
import JustificativaModal from "./components/JustificativaModal";

const PHP_API_URL = "http://10.110.100.227/qualitycontrol/SIGMA/teste_integracao/uploads/sigma_producao_api.php";

export default function GestaoLotesPage() {
  const [activeTab, setActiveTab] = useState<"ativos" | "ignorados">("ativos");
  const [producaoBruta, setProducaoBruta] = useState<any[]>([]);
  const [listaIgnorados, setListaIgnorados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // 🔥 NOVO: Estado que guarda os filtros do Excel por coluna
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  
  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const resProd = await fetch(PHP_API_URL);
      const prodData = resProd.ok ? await resProd.json() : [];
      
      const resIgnorados = await fetch("/api/validacao/gestao-lotes");
      const ignoradosData = resIgnorados.ok ? await resIgnorados.json() : { ignorados: [] };

      setProducaoBruta(Array.isArray(prodData) ? prodData : []);
      setListaIgnorados(ignoradosData.ignorados || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
      setSelectedIds([]); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { ativosList, ignoradosList } = useMemo(() => {
    const ignoradosIds = new Set(listaIgnorados.map(item => String(item.id)));
    const ativos: any[] = [];
    const ignorados: any[] = [];

    producaoBruta.forEach(item => {
      const categoriaInferida = inferirCategoria(item.MAKTX, "");
      const itemMapeado = { ...item, CATEGORIA_INFERIDA: categoriaInferida };

      if (ignoradosIds.has(String(item.id))) {
        const info = listaIgnorados.find(i => String(i.id) === String(item.id));
        ignorados.push({ ...itemMapeado, motivo_ignorado: info?.motivo || "Sem motivo" });
      } else {
        ativos.push(itemMapeado);
      }
    });

    return { ativosList: ativos, ignoradosList: ignorados };
  }, [producaoBruta, listaIgnorados]);

  // Base pura (para a tabela extrair as opções únicas de filtro)
  const baseData = activeTab === "ativos" ? ativosList : ignoradosList;

  // Aplicação dos Filtros Excel + Busca Global
  const displayData = useMemo(() => {
    let filtrado = [...baseData];

    // 1. Aplica Filtros das Colunas (Modo Excel)
    Object.keys(columnFilters).forEach(key => {
      const selectedValues = columnFilters[key];
      if (selectedValues.length > 0) {
        filtrado = filtrado.filter(item => {
          // Trata a formatação da Data para cruzar corretamente
          let val = String(item[key] || "--");
          if (key === 'DATA' && item.DATA) {
            val = new Date(item.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
          }
          return selectedValues.includes(val);
        });
      }
    });

    // 2. Aplica a Busca Global (Search Term)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtrado = filtrado.filter(item => 
        (item.MAKTX && item.MAKTX.toLowerCase().includes(term)) ||
        (item.id && String(item.id).includes(term)) ||
        (item.MATNR && item.MATNR.toLowerCase().includes(term)) ||
        (item.TIPO_PROD && item.TIPO_PROD.toLowerCase().includes(term)) ||
        (item.CATEGORIA_INFERIDA && item.CATEGORIA_INFERIDA.toLowerCase().includes(term))
      );
    }
    
    return filtrado.slice(0, 100); // Limita renderização
  }, [baseData, searchTerm, columnFilters]);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === displayData.length && displayData.length > 0 ? [] : displayData.map(item => String(item.id)));

  // Limpa tudo ao trocar de aba
  const handleTabChange = (tab: "ativos" | "ignorados") => {
    setActiveTab(tab);
    setSelectedIds([]);
    setColumnFilters({}); // Reseta os filtros de coluna ao trocar a aba
  };

  const handleOcultar = async () => {
    if (selectedIds.length === 0 || !motivo.trim()) return;
    try {
      const res = await fetch("/api/validacao/gestao-lotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedIds, motivo: motivo, usuario: "Admin" }) });
      if (res.ok) { setShowModal(false); setMotivo(""); fetchData(); }
    } catch (e) { console.error("Erro ao ocultar", e); }
  };

  const handleRestaurar = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/validacao/gestao-lotes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedIds }) });
      if (res.ok) fetchData(); 
    } catch (e) { console.error("Erro ao restaurar", e); }
  };

  return (
    <div style={{ color: "#fff", minHeight: "100vh", padding: "24px 32px", position: "relative" }}>
      
      <JustificativaModal 
        show={showModal} onClose={() => setShowModal(false)} onConfirm={handleOcultar} 
        motivo={motivo} setMotivo={setMotivo} selectedCount={selectedIds.length} 
      />

      <GestaoLotesHeader />

      <GestaoLotesFiltros 
        activeTab={activeTab} setActiveTab={handleTabChange} 
        ativosCount={ativosList.length} ignoradosCount={ignoradosList.length} 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        onTabChange={() => {}} // Já tratado na função handleTabChange
      />

      <GestaoLotesTabela 
        baseData={baseData} // Enviamos os dados puros para ler as opções únicas
        displayData={displayData} 
        loading={loading} activeTab={activeTab} 
        selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} 
        onShowModal={() => setShowModal(true)} onRestaurar={handleRestaurar}
        columnFilters={columnFilters} setColumnFilters={setColumnFilters} // Enviamos os controles de filtro
      />
      
    </div>
  );
}