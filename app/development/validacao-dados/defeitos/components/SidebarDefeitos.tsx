"use client";

import React, { useEffect, useState } from "react";
import { LayoutGrid, FolderOpen, Activity } from "lucide-react";
import "./SidebarDefeitos.css";

// ============================================================================
// 🚀 MICRO-COMPONENTE: Barra de Progresso Animada à Prova de Cache
// ============================================================================
function AnimatedDefeitosProgressBar({ targetPct, statusClass }: { targetPct: number, statusClass: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Dá 50ms para o React colocar o elemento na tela no 0%, e depois dispara para o tamanho real.
    const timer = setTimeout(() => {
      setWidth(Number.isFinite(targetPct) ? Math.max(0, Math.min(100, targetPct)) : 0);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [targetPct]);

  return (
    <div className="progress-bar">
      <div
        className={`progress-fill ${statusClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function SidebarDefeitos({
  fonte,
  setFonte,
  perBase,
}: {
  fonte: string;
  setFonte: ((f: string) => void) | React.Dispatch<React.SetStateAction<any>>;
  perBase: any;
}) {

  function getStatusClass(pct: number) {
    if (pct >= 99.9) return "status-green";
    if (pct >= 50) return "status-yellow";
    return "status-red";
  }

  const { todas, ...categoriasRestantes } = perBase || {};
  const listaCategorias = Object.keys(categoriasRestantes || {}).sort();

  const renderCard = (key: string, label: string, isMain = false) => {
    const b = perBase?.[key];
    if (!b) return null;

    const pct = Number(b?.percentIdentified ?? 0);
    const linhas = b?.total ?? 0;
    const defeitos = b?.totalDefeitos ?? 0;
    const isActive = fonte === key;

    return (
      <div
        key={key}
        onClick={() => setFonte(key)}
        className={`sidebar-card ${isActive ? "active" : ""}`}
      >
        <div className="card-header">
          <div className="card-title">
            {isMain ? (
              <LayoutGrid size={18} />
            ) : (
              <FolderOpen size={18} />
            )}
            <span>{label}</span>
          </div>

          <span className={`card-percent ${getStatusClass(pct)}`}>
            {pct.toFixed(1)}%
          </span>
        </div>

        {!isMain ? (
          <>
            <div className="card-subinfo">
              <span>{linhas.toLocaleString()} un.</span>
              <span>{defeitos.toLocaleString()} linhas</span>
            </div>

            {/* ✅ Substituímos a div estática pelo nosso novo componente animado */}
            <AnimatedDefeitosProgressBar 
              targetPct={pct} 
              statusClass={getStatusClass(pct)} 
            />
          </>
        ) : (
          <div className="card-main-info">
            <Activity size={16} />
            Volume total: <strong>{defeitos.toLocaleString()}</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="sidebar-glass">
      <div className="sidebar-title">SIGMA-Q</div>

      <div className="sidebar-section-title">Global</div>
      {renderCard("todas", "Visão Geral", true)}

      <div className="sidebar-section-title">Categorias</div>

      {listaCategorias.map((cat) => renderCard(cat, cat))}
    </aside>
  );
}