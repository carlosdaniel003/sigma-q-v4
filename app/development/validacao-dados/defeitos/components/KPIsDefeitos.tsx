"use client";

import React from "react";
import { FileText, Wrench, AlertTriangle, Brain } from "lucide-react";

export default function KPIsDefeitos({
  total,
  totalDefeitos,
  notIdentified,
  aiOverall,
}: {
  total: number;
  totalDefeitos: number;
  notIdentified: number;
  aiOverall: number;
}) {

  // ================================
  // 🎨 Lógica Dinâmica de Cores Premium
  // ================================
  
  // 1. Precisão da IA
  let aiColor = "#ef4444"; // Vermelho
  let aiBg = "rgba(239, 68, 68, 0.12)";
  let aiBorder = "rgba(239, 68, 68, 0.2)";
  let aiGlow = "0 0 12px rgba(239, 68, 68, 0.4)";

  if (aiOverall >= 99) {
    aiColor = "#4ade80"; // Verde
    aiBg = "rgba(74, 222, 128, 0.12)";
    aiBorder = "rgba(74, 222, 128, 0.2)";
    aiGlow = "0 0 12px rgba(74, 222, 128, 0.4)";
  } else if (aiOverall >= 50) {
    aiColor = "#facc15"; // Amarelo
    aiBg = "rgba(250, 204, 21, 0.12)";
    aiBorder = "rgba(250, 204, 21, 0.2)";
    aiGlow = "0 0 12px rgba(250, 204, 21, 0.4)";
  }

  // 2. Não Identificados
  const isZero = notIdentified === 0;
  const notIdColor = isZero ? "#4ade80" : "#f87171";
  const notIdBg = isZero ? "rgba(74, 222, 128, 0.12)" : "rgba(239, 68, 68, 0.12)";
  const notIdBorder = isZero ? "rgba(74, 222, 128, 0.2)" : "rgba(239, 68, 68, 0.2)";
  const notIdGlow = isZero ? "0 0 12px rgba(74, 222, 128, 0.4)" : "0 0 12px rgba(239, 68, 68, 0.4)";

  return (
    <section 
      className="fade-in" 
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px",
        width: "100%"
      }}
    >
      {/* 1️⃣ Registros Processados */}
      <div 
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "transform 0.2s, background 0.2s",
          cursor: "default"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(96, 165, 250, 0.12)", padding: 10, borderRadius: 12, border: "1px solid rgba(96, 165, 250, 0.2)", display: "flex", alignItems: "center" }}>
            <FileText size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Registros Processados
          </div>
        </div>
        <div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.1 }}>
            {total.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
            Linhas brutas analisadas
          </div>
        </div>
      </div>

      {/* 2️⃣ Volume de Defeitos */}
      <div 
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "transform 0.2s, background 0.2s",
          cursor: "default"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(192, 132, 252, 0.12)", padding: 10, borderRadius: 12, border: "1px solid rgba(192, 132, 252, 0.2)", display: "flex", alignItems: "center" }}>
            <Wrench size={20} color="#c084fc" />
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Volume de Defeitos
          </div>
        </div>
        <div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.1 }}>
            {totalDefeitos.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
            Somatória de peças (Qty)
          </div>
        </div>
      </div>

      {/* 3️⃣ Não Identificados */}
      <div 
        style={{
          background: "rgba(255,255,255,0.015)",
          border: `1px solid ${notIdBorder}`,
          borderRadius: 16,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "default"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = notIdGlow; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: notIdBg, padding: 10, borderRadius: 12, border: `1px solid ${notIdBorder}`, display: "flex", alignItems: "center" }}>
            <AlertTriangle size={20} color={notIdColor} />
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: notIdColor, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Não Identificados
          </div>
        </div>
        <div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: notIdColor, lineHeight: 1.1, textShadow: notIdGlow }}>
            {notIdentified.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
            Volume de peças inconsistentes
          </div>
        </div>
      </div>

      {/* 4️⃣ Precisão da IA */}
      <div 
        style={{
          background: "rgba(255,255,255,0.015)",
          border: `1px solid ${aiBorder}`,
          borderRadius: 16,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "default"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = aiGlow; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: aiBg, padding: 10, borderRadius: 12, border: `1px solid ${aiBorder}`, display: "flex", alignItems: "center" }}>
            <Brain size={20} color={aiColor} />
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: aiColor, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Precisão da IA
          </div>
        </div>
        <div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: aiColor, lineHeight: 1.1, textShadow: aiGlow }}>
            {aiOverall.toFixed(2)}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
            Qualidade da identificação
          </div>
        </div>
      </div>

    </section>
  );
}