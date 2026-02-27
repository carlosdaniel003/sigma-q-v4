"use client";

import { useState, useEffect } from "react";
import "./DashboardLoading-glass.css"; // ✅ CSS IMPORTADO

export default function DashboardLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  // ✅ MENSAGENS ATUALIZADAS PARA O CONTEXTO DE DASHBOARD
  const messages = [
    "Consultando volumes de produção...",
    "Calculando PPM Global e Metas...",
    "Agrupando defeitos por categoria...",
    "Gerando gráficos de tendência...",
    "Finalizando visualização gerencial...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500); 

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="loading-glass-container">
      
      {/* --- ROBOT SVG ANIMADO (MINIMALISTA) --- */}
      <div className="robot-wrapper">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="robot-svg"
        >
          {/* Corpo translúcido */}
          <rect x="3" y="6" width="18" height="14" rx="4" fill="rgba(255,255,255,0.05)" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Olhos */}
          <circle cx="8.5" cy="11.5" r="1.5" fill="#e2e8f0" className="robot-eye" style={{ animationDelay: "0ms" }} />
          <circle cx="15.5" cy="11.5" r="1.5" fill="#e2e8f0" className="robot-eye" style={{ animationDelay: "200ms" }} />
          
          {/* Boca (onda) */}
          <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Antena */}
          <path d="M12 2V6" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="12" cy="2" r="1.5" fill="#e2e8f0" className="robot-antenna" style={{ transformOrigin: "12px 2px" }} />
          <circle cx="12" cy="2" r="1.5" fill="#e2e8f0" />
          
          {/* Orelhas */}
          <path d="M1 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* --- TEXTOS --- */}
      <div className="loading-text-wrapper">
        <h3 className="loading-title">
          Atualizando Indicadores
        </h3>
        
        <p key={messageIndex} className="loading-message">
          {messages[messageIndex]}
        </p>
      </div>

    </div>
  );
}