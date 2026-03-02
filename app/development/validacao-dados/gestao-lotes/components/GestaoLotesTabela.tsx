import React, { useState } from "react";
import { EyeOff, RotateCcw, Filter, Download } from "lucide-react";
import * as XLSX from "xlsx"; // 🔥 Importando a biblioteca do Excel
import "./GestaoLotesTabela.css"; 

export default function GestaoLotesTabela({
  baseData, displayData, loading, activeTab, selectedIds, 
  toggleSelect, toggleSelectAll, onShowModal, onRestaurar,
  columnFilters, setColumnFilters
}: any) {
  
  const hasSelection = selectedIds.length > 0;
  const [openFilterMenu, setOpenFilterMenu] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÃO DE EXPORTAÇÃO PARA EXCEL NATIVO (.xlsx)
  // ============================================================================
  const handleExportXLSX = () => {
    if (!displayData || displayData.length === 0) return;

    // 1. Mapeamos os dados exatamente como queremos que apareçam nas colunas do Excel
    const dataToExport = displayData.map((item: any) => ({
      "ID SQL": item.id || "",
      "Data": item.DATA ? new Date(item.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "",
      "Hora": item.HORA || "",
      "Modelo (MAKTX)": item.MAKTX || "",
      "MATNR": item.MATNR || "",
      "Categoria": item.CATEGORIA_INFERIDA || "",
      "Tipo Prod.": item.TIPO_PROD || "",
      "Fábrica": item.FABRICA || "",
      "Tipo Mov.": item.TIPO_MOV || "",
      // Convertendo para número para o Excel reconhecer nativamente e permitir somas
      "Quantidade": parseFloat(String(item.QUANTIDADE || "0").replace(/\./g, "").replace(",", ".")),
      "Status": activeTab === "ativos" ? "ATIVO" : "OCULTO",
      "Motivo (se oculto)": item.motivo_ignorado || ""
    }));

    // 2. Cria a folha de cálculo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Opcional: Ajustar largura das colunas
    const wscols = [
      { wch: 10 }, // ID
      { wch: 12 }, // Data
      { wch: 10 }, // Hora
      { wch: 45 }, // Modelo
      { wch: 15 }, // MATNR
      { wch: 15 }, // Categoria
      { wch: 15 }, // Tipo Prod
      { wch: 10 }, // Fábrica
      { wch: 15 }, // Tipo Mov
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Status
      { wch: 30 }, // Motivo
    ];
    worksheet["!cols"] = wscols;

    // 3. Cria o Livro (Workbook) e anexa a folha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gestão de Lotes");

    // 4. Exporta para o ficheiro final com a data de hoje
    const dataAtual = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `SIGMA_Lotes_${activeTab}_${dataAtual}.xlsx`);
  };

  // ============================================================================
  // COMPONENTE DE CABEÇALHO DA COLUNA (COM FILTRO)
  // ============================================================================
  const ColHeader = ({ label, colKey }: { label: string, colKey: string }) => {
    const isActive = columnFilters[colKey] && columnFilters[colKey].length > 0;
    
    const uniqueOptions = Array.from(new Set(baseData.map((item: any) => {
      if (colKey === 'DATA' && item.DATA) return new Date(item.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      return String(item[colKey] || "--");
    }))).sort() as string[];

    const handleToggleOption = (val: string) => {
      const current = columnFilters[colKey] || [];
      const updated = current.includes(val) ? current.filter((v: string) => v !== val) : [...current, val];
      setColumnFilters({ ...columnFilters, [colKey]: updated });
    };

    const clearColFilter = () => {
      const newFilters = { ...columnFilters };
      delete newFilters[colKey];
      setColumnFilters(newFilters);
      setOpenFilterMenu(null);
    };

    return (
      <div className="gl-th-wrapper">
        <div className="gl-th-content" onClick={() => setOpenFilterMenu(openFilterMenu === colKey ? null : colKey)}>
          {label}
          <Filter size={14} className={`gl-filter-icon ${isActive ? "is-active" : ""}`} />
        </div>

        {openFilterMenu === colKey && (
          <div className="gl-filter-popover">
            <div className="gl-popover-header">
              <span>Filtrar {label}</span>
              {isActive && <button onClick={clearColFilter} className="gl-popover-clear">Limpar</button>}
            </div>
            <div className="gl-popover-list">
              {uniqueOptions.map((opt, i) => (
                <label key={i} className="gl-popover-item">
                  <input 
                    type="checkbox" className="gl-checkbox gl-checkbox-small"
                    checked={(columnFilters[colKey] || []).includes(opt)}
                    onChange={() => handleToggleOption(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="gl-table-panel">
      
      {/* FECHA O MENU SE CLICAR FORA (Overlay invisível) */}
      {openFilterMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpenFilterMenu(null)} />
      )}

      {/* BARRA DE AÇÃO */}
      <div className="gl-action-bar">
        <span className={`gl-selection-count ${hasSelection ? "active" : "inactive"}`}>
          {selectedIds.length} itens selecionados
        </span>
        
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Botão de Exportação XLSX */}
          <button 
            onClick={handleExportXLSX} 
            className="gl-btn gl-btn-export" 
            disabled={displayData.length === 0}
            style={{ opacity: displayData.length === 0 ? 0.5 : 1, cursor: displayData.length === 0 ? "not-allowed" : "pointer" }}
            title="Exportar dados para Excel (.xlsx)"
          >
            <Download size={18} /> Exportar Excel
          </button>

          {/* Botões de Ação Dinâmicos */}
          {hasSelection && (
            activeTab === "ativos" ? (
              <button onClick={onShowModal} className="gl-btn gl-btn-danger"><EyeOff size={18} /> Ocultar Selecionados</button>
            ) : (
              <button onClick={onRestaurar} className="gl-btn gl-btn-success"><RotateCcw size={18} /> Restaurar Lotes</button>
            )
          )}
        </div>
      </div>

      {/* CABEÇALHO DA TABELA */}
      <div className="gl-grid-layout gl-table-header" style={{ position: "relative", zIndex: 50 }}>
        <div style={{ textAlign: "center" }}>
           <input type="checkbox" className="gl-checkbox" checked={hasSelection && selectedIds.length === displayData.length && displayData.length > 0} onChange={toggleSelectAll} />
        </div>
        <ColHeader label="ID SQL" colKey="id" />
        <ColHeader label="Data/Hora" colKey="DATA" />
        <ColHeader label="Modelo (MAKTX)" colKey="MAKTX" />
        <ColHeader label="Categoria" colKey="CATEGORIA_INFERIDA" />
        <ColHeader label="Tipo Prod." colKey="TIPO_PROD" />
        <ColHeader label="Fábrica" colKey="FABRICA" />
        <ColHeader label="Tipo Mov." colKey="TIPO_MOV" />
        <div style={{ textAlign: "right" }}>Quantidade</div>
        <div style={{ textAlign: "center" }}>Status</div>
      </div>

      {/* DADOS DA TABELA */}
      {loading ? (
        <div className="gl-empty-state">Carregando dados do servidor...</div>
      ) : displayData.length === 0 ? (
        <div className="gl-empty-state">Nenhum lote corresponde aos filtros selecionados.</div>
      ) : (
        <div className="gl-table-scroll-area">
          {displayData.map((item: any, idx: number) => {
            const isSelected = selectedIds.includes(String(item.id));
            return (
              <div key={item.id || idx} className={`gl-grid-layout gl-table-row ${isSelected ? "selected" : ""}`}>
                <div style={{ textAlign: "center" }}>
                  <input type="checkbox" className="gl-checkbox" checked={isSelected} onChange={() => toggleSelect(String(item.id))} />
                </div>
                <div className="gl-id-text">{item.id}</div>
                <div className="gl-date-text">
                  {item.DATA ? new Date(item.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "--"} <br/>
                  <span className="gl-time-text">{item.HORA || ""}</span>
                </div>
                <div>
                  <div className="gl-model-text" title={item.MAKTX}>{item.MAKTX || "Desconhecido"}</div>
                  <div className="gl-matnr-text">{item.MATNR || "--"}</div>
                </div>
                <div className="gl-category-text">{item.CATEGORIA_INFERIDA || "--"}</div>
                <div className="gl-default-text">{item.TIPO_PROD || "--"}</div>
                <div className="gl-default-text">{item.FABRICA || "--"}</div>
                <div className={item.TIPO_MOV === "FORNECIDO" ? "gl-mov-success" : "gl-mov-default"}>{item.TIPO_MOV || "--"}</div>
                <div className="gl-qty-text">
                  {(() => {
                    if (!item.QUANTIDADE) return "0 und.";
                    const realQty = parseFloat(String(item.QUANTIDADE).replace(",", "."));
                    return !isNaN(realQty) ? `${realQty.toLocaleString('pt-BR')} und.` : "0 und.";
                  })()}
                </div>
                <div className="gl-badge-wrapper">
                  {activeTab === "ativos" ? (
                     <span className="gl-badge ativo">ATIVO</span>
                  ) : (
                     <div className="gl-badge-col-stacked">
                       <span className="gl-badge oculto">OCULTO</span>
                       <span className="gl-badge-reason" title={item.motivo_ignorado}>{item.motivo_ignorado}</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}