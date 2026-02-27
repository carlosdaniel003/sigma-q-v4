"use client";

import { useState, useEffect } from "react";
import "./DiagnosticoLoading-glass.css"; // ✅ CSS IMPORTADO

export default function DiagnosticoLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  // Mensagens que vão alternar para dar sensação de progresso real
  const messages = [
    "Acessando base de dados...",
    "Calculando indicadores de PPM...",
    "Verificando histórico de falhas...",
    "Identificando padrões de reincidência...",
    "Gerando insights de melhoria...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500); // Troca de mensagem a cada 1.5 segundos

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="loading-glass-container">
      
      {/* --- ROBOT SVG ANIMADO --- */}
      <div className="robot-wrapper">
        {/* Efeito de brilho atrás do robo */}
        <div className="robot-glow-bg" />
        
        {/* SVG do Robô */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="robot-svg"
        >
          {/* Cabeça */}
          <rect x="3" y="6" width="18" height="14" rx="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
          
          {/* Olhos (Animados no CSS) */}
          <circle cx="8.5" cy="11.5" r="1.5" fill="#3b82f6" className="robot-eye" style={{ animationDelay: "0ms" }} />
          <circle cx="15.5" cy="11.5" r="1.5" fill="#3b82f6" className="robot-eye" style={{ animationDelay: "200ms" }} />
          
          {/* Boca (onda) */}
          <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Antena */}
          <path d="M12 2V6" stroke="#60a5fa" strokeWidth="1.5" />
          
          {/* A bolinha da antena a emitir sinal (ping) */}
          <circle cx="12" cy="2" r="1.5" fill="#60a5fa" className="robot-antenna" style={{ transformOrigin: "12px 2px" }} />
          <circle cx="12" cy="2" r="1.5" fill="#60a5fa" />
          
          {/* Orelhas */}
          <path d="M1 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* --- TEXTOS --- */}
      <div className="loading-text-wrapper">
        <h3 className="loading-title">
          Diagnóstico Inteligente
        </h3>
        
        {/* Mensagem dinâmica com fade effect. A 'key' reseta a animação a cada troca */}
        <p key={messageIndex} className="loading-message">
          {messages[messageIndex]}
        </p>
      </div>

    </div>
  );
}