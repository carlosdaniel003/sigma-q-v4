"use client";

import React from "react";
import "../../tabs.css"; // Mantendo seus estilos globais
import { useSigmaValidation } from "../context/SigmaValidationProvider";

/* ======================================================
   MENSAGENS DE CONTEXTO (SQL 2026 & CATEGORIAS)
====================================================== */
function getTaskMessage(
  task: "defeitos" | "producao" | "ppm" | null
): { title: string; subtitle: string } {
  switch (task) {
    case "defeitos":
      return {
        title: "Validando Defeitos",
        subtitle: "Consultando base SQL 2026 (Categorias PA)..."
      };

    case "producao":
      return {
        title: "Sincronizando Produção",
        subtitle: "Verificando volumes fabris no banco de dados..."
      };

    case "ppm":
      return {
        title: "Calculando Indicadores",
        subtitle: "Gerando PPM consolidado por categoria..."
      };

    default:
      return {
        title: "Inicializando SIGMA-Q",
        subtitle: "Estabelecendo conexão segura com SQL..."
      };
  }
}

/* ======================================================
   LOADER GLOBAL (ESTILO DASHBOARD)
====================================================== */
export default function LoaderGlobal({
  progress,
}: {
  progress: number;
}) {
  const { currentTask } = useSigmaValidation();
  const safeProgress = Math.min(100, Math.max(0, progress));
  const messages = getTaskMessage(currentTask);

  return (
    <div className="sigma-loader-overlay backdrop-blur-md" style={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          gap: 24,
          transform: "scale(1.1)" // Um pouco maior para destaque
        }}
      >
        {/* --- ROBOT SVG ANIMADO (Igual ao Dashboard) --- */}
        <div className="relative" style={{ position: 'relative' }}>
          {/* Glow Effect Background */}
          <div 
            className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full" 
            style={{ 
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#3b82f6',
                filter: 'blur(24px)',
                opacity: 0.2,
                borderRadius: '9999px',
                transform: "scale(1.5)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            }}
          />
          
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 animate-bounce-slow"
            style={{ position: 'relative', zIndex: 10, animation: "bounce-slow 3s infinite" }}
          >
            <rect x="3" y="6" width="18" height="14" rx="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
            
            {/* Olhos piscando */}
            <circle cx="8.5" cy="11.5" r="1.5" fill="#3b82f6" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <circle cx="15.5" cy="11.5" r="1.5" fill="#3b82f6" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            
            <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Antena com Ping */}
            <path d="M12 2V6" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="12" cy="2" r="1.5" fill="#60a5fa" style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
            
            <path d="M1 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <path d="M23 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* --- TEXTOS --- */}
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: 8,
              letterSpacing: '0.025em'
            }}
          >
            {messages.title}
          </h3>
          
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              animation: "fadeIn 0.5s ease-in-out"
            }}
          >
            {messages.subtitle}
          </p>

          {/* Porcentagem Discreta */}
          <div style={{ 
              marginTop: '12px', 
              fontSize: '0.75rem', 
              color: '#3b82f6', 
              fontFamily: 'monospace',
              opacity: 0.8
          }}>
            {Math.floor(safeProgress)}%
          </div>
        </div>

        {/* --- STYLES INLINE (Para garantir animação) --- */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce-slow {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}