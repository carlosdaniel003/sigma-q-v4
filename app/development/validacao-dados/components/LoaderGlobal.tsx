"use client";

import React from "react";
import "../../tabs.css";
import { useSigmaValidation } from "../context/SigmaValidationProvider";

import "./loader-global-glass.css"; // ✅ Importação do CSS Glassmorphism Clean

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
   LOADER GLOBAL — CLEAN GLASSMORPHISM
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
    <div className="sigma-loader-overlay">
      <div className="sigma-loader-card">

        {/* ROBÔ MINIMALISTA (CINZA/PRATA) */}
        <div className="sigma-robot-wrapper">
          <svg
            className="sigma-robot-svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Corpo translúcido */}
            <rect x="3" y="6" width="18" height="14" rx="4" fill="rgba(255,255,255,0.05)" stroke="#94a3b8" strokeWidth="1.5" />
            
            {/* Olhos que piscam suavemente */}
            <circle cx="8.5" cy="11.5" r="1.5" fill="#e2e8f0" className="robot-eye" />
            <circle cx="15.5" cy="11.5" r="1.5" fill="#e2e8f0" className="robot-eye" />
            
            {/* Boca */}
            <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Antena com onda */}
            <path d="M12 2V6" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="12" cy="2" r="1.5" fill="#e2e8f0" className="robot-antenna" />
            
            {/* Braços */}
            <path d="M1 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <path d="M23 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* TEXTOS */}
        <div className="sigma-loader-text-wrapper">
          <h3 className="sigma-loader-title">
            {messages.title}
          </h3>
          <p className="sigma-loader-subtitle">
            {messages.subtitle}
          </p>
          <div className="sigma-loader-percent">
            {Math.floor(safeProgress)}%
          </div>
        </div>

        {/* BARRA DE PROGRESSO CLEAN */}
        <div className="sigma-progress-wrapper">
          <div
            className="sigma-progress-bar"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

      </div>
    </div>
  );
}