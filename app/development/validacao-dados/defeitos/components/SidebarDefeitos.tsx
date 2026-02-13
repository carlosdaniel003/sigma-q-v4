"use client";

import React from "react";
import { LayoutGrid, FolderOpen, ChevronRight, Activity } from "lucide-react";

export default function SidebarDefeitos({
  fonte,
  setFonte,
  perBase,
}: {
  fonte: string;
  // Aceita função void ou o Dispatch do React, flexibilizando o uso
  setFonte: ((f: string) => void) | React.Dispatch<React.SetStateAction<any>>;
  perBase: any;
}) {
  
  // ==========================================
  // LÓGICA DE CORES PREMIUM E NEON
  // ==========================================
  function getPalette(pct: number) {
    if (pct >= 99.9) return { 
        color: "#4ade80", 
        bg: "rgba(74, 222, 128, 0.15)", 
        border: "rgba(74, 222, 128, 0.3)",
        glow: "0 0 10px rgba(74, 222, 128, 0.4)" 
    };
    if (pct >= 50) return { 
        color: "#facc15", 
        bg: "rgba(250, 204, 21, 0.15)", 
        border: "rgba(250, 204, 21, 0.3)",
        glow: "0 0 10px rgba(250, 204, 21, 0.4)" 
    };
    return { 
        color: "#f87171", 
        bg: "rgba(239, 68, 68, 0.15)", 
        border: "rgba(239, 68, 68, 0.3)",
        glow: "0 0 10px rgba(239, 68, 68, 0.4)" 
    };
  }

  // 1. Separa "todas" do resto das categorias
  const { todas, ...categoriasRestantes } = perBase || {};
  
  // 2. Ordena as categorias alfabeticamente
  const listaCategorias = Object.keys(categoriasRestantes || {}).sort();

  // ==========================================
  // RENDERIZAÇÃO DO CARD
  // ==========================================
  const renderCard = (key: string, label: string, isMain: boolean = false) => {
    const b = perBase?.[key];
    if (!b) return null;

    const pct = Number(b?.percentIdentified ?? 0);
    const linhas = b?.total ?? 0;
    const defeitos = b?.totalDefeitos ?? 0;
    const isActive = fonte === key;
    const palette = getPalette(pct);

    return (
      <div
        key={key}
        onClick={() => setFonte(key)}
        style={{
            background: isActive ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${isActive ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.05)"}`,
            borderLeft: isActive ? "3px solid #60a5fa" : "3px solid transparent",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: isMain ? "24px" : "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        }}
        onMouseEnter={(e) => { 
            if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)"; 
                e.currentTarget.style.transform = "translateX(4px)";
            }
        }}
        onMouseLeave={(e) => { 
            if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.015)"; 
                e.currentTarget.style.transform = "translateX(0)";
            }
        }}
      >
        {/* HEADER DO CARD */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isMain ? (
                <LayoutGrid size={16} color={isActive ? "#60a5fa" : "#60a5fa"} />
            ) : (
                <FolderOpen size={16} color={isActive ? "#60a5fa" : "#94a3b8"} />
            )}
            <span style={{ 
                fontSize: isMain ? "0.95rem" : "0.85rem", 
                fontWeight: isMain ? 700 : 600, 
                color: isActive ? "#f8fafc" : "#cbd5e1",
                letterSpacing: 0.5
            }}>
              {label.toUpperCase()}
            </span>
          </div>

          <span style={{ 
              color: palette.color, 
              fontWeight: 800, 
              fontSize: "0.85rem",
              background: palette.bg,
              padding: "2px 8px",
              borderRadius: "12px",
              border: `1px solid ${palette.border}`
          }}>
            {pct.toFixed(1)}%
          </span>
        </div>

        {/* SUBINFO E BARRA DE PROGRESSO */}
        {!isMain ? (
          <>
            <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{linhas.toLocaleString()} Linhas</span>
              <span>
                <strong style={{ color: "#e2e8f0" }}>{defeitos.toLocaleString()}</strong> Defeitos.
              </span>
            </div>

            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: palette.color,
                  boxShadow: pct < 100 ? palette.glow : "none",
                  borderRadius: "10px",
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              />
            </div>
          </>
        ) : (
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Activity size={14} color="#64748b" />
                Volume Total: <strong style={{ color: "#e2e8f0" }}>{defeitos.toLocaleString()}</strong> defeitos
            </div>
        )}
      </div>
    );
  };

  return (
    <aside className="defeitos-sidebar" style={{
        // A classe defeitos-sidebar é mantida para o Grid principal, mas forçamos os estilos internos
        display: "flex", flexDirection: "column", padding: "20px 16px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", borderRight: "1px solid rgba(255,255,255,0.05)",
        overflowY: "auto", height: "100%", boxSizing: "border-box"
    }}>
      {/* TÍTULO DA SIDEBAR */}
      <div style={{ 
          color: "#ffffff", fontSize: "1.4rem", fontWeight: 900, letterSpacing: 1.5, 
          marginBottom: 32, display: "flex", alignItems: "center", gap: 8, padding: "0 8px"
      }}>
        <div style={{ width: 8, height: 24, background: "#60a5fa", borderRadius: 4, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }} />
        SIGMA-Q
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        
        {/* GRUPO GLOBAL */}
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, paddingLeft: 8 }}>
            Visão Global
        </div>
        {renderCard("todas", "VISÃO GERAL", true)}

        {/* GRUPO CATEGORIAS */}
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, paddingLeft: 8 }}>
            Categorias Operacionais
        </div>
        
        {listaCategorias.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {listaCategorias.map((cat) => renderCard(cat, cat))}
          </div>
        ) : (
          <div style={{ padding: "16px", color: "#64748b", fontSize: "0.85rem", textAlign: "center", background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)" }}>
            Carregando categorias...
          </div>
        )}

      </div>
    </aside>
  );
}