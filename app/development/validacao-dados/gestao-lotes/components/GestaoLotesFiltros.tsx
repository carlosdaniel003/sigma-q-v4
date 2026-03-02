import React from "react";
import { Search } from "lucide-react";
import "./GestaoLotesFiltros.css"; // 🔥 Alterado o caminho do CSS

export default function GestaoLotesFiltros({
  activeTab, setActiveTab, ativosCount, ignoradosCount, searchTerm, setSearchTerm, onTabChange
}: any) {
  return (
    <section className="gl-filters-panel">
      
      {/* Segmented Control (Abas) */}
      <div className="gl-tabs-wrapper">
        <button 
          className={`gl-tab-btn ${activeTab === "ativos" ? "active-blue" : ""}`}
          onClick={() => { setActiveTab("ativos"); onTabChange(); }}
        >
          Lotes Ativos ({ativosCount})
        </button>
        <button 
          className={`gl-tab-btn ${activeTab === "ignorados" ? "active-red" : ""}`}
          onClick={() => { setActiveTab("ignorados"); onTabChange(); }}
        >
          Itens Ignorados ({ignoradosCount})
        </button>
      </div>
      
      {/* Search Input Animado */}
      <div className="gl-search-wrapper">
        <Search size={18} className="gl-search-icon" />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar Modelo, Categoria ou ID..." 
          className="gl-search-input"
        />
      </div>
      
    </section>
  );
}