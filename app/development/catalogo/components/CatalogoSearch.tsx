// app/development/catalogo/components/CatalogoSearch.tsx
"use client";

import React from "react";
import { Search } from "lucide-react";

export function CatalogoSearch({ value, onChange, placeholder }: any) {
  return (
    <div className="search-container fade-in">
      <div className="search-glass-wrapper">
        <Search className="search-icon" size={20} />
        
        <input
          type="text"
          placeholder={placeholder || "Pesquisar no catálogo..."}
          className="glass-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* ✅ CSS ISOLADO COM IPHONE GLASSMORPHISM */}
      <style jsx>{`
        /* --- Container e Animação --- */
        .search-container {
          width: 100%;
          margin-bottom: 28px;
          animation: slideDownGlass 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        /* --- O Vidro (Wrapper) --- */
        .search-glass-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 56px; /* Altura generosa padrão touch iOS */
          overflow: hidden;
          
          /* Efeito Liquid Glass Profundo */
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.5),
            rgba(30, 41, 59, 0.3)
          );
          backdrop-filter: blur(45px) saturate(150%);
          -webkit-backdrop-filter: blur(45px) saturate(150%);
          
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
            
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Reflexo em Movimento (Sweep) */
        .search-glass-wrapper::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.8s ease;
          pointer-events: none;
          z-index: 1;
        }

        .search-glass-wrapper:hover::before {
          left: 150%;
        }

        /* Hover no Wrapper */
        .search-glass-wrapper:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(96, 165, 250, 0.3);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
        }

        /* Estado "Focus" (Quando o utilizador clica para digitar) */
        .search-glass-wrapper:focus-within {
          border-color: rgba(96, 165, 250, 0.6);
          background: rgba(15, 23, 42, 0.7);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(59, 130, 246, 0.25),
            inset 0 0 12px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        /* --- Ícone da Lupa --- */
        .search-glass-wrapper :global(.search-icon) {
          margin-left: 20px;
          color: #64748b;
          transition: all 0.3s ease;
          z-index: 2;
        }

        /* O Ícone acende em Azul quando se digita */
        .search-glass-wrapper:focus-within :global(.search-icon) {
          color: #60a5fa;
          transform: scale(1.1);
        }

        /* --- O Input Real --- */
        .glass-input {
          flex: 1;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          padding: 0 20px 0 14px;
          color: #f8fafc;
          font-size: 1.05rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          z-index: 2;
        }

        /* Oculta aquele "X" automático que alguns browsers põem */
        .glass-input::-webkit-search-decoration,
        .glass-input::-webkit-search-cancel-button,
        .glass-input::-webkit-search-results-button,
        .glass-input::-webkit-search-results-decoration {
          display: none;
        }

        .glass-input::placeholder {
          color: #475569;
          font-weight: 400;
        }

        /* --- Animação de Entrada --- */
        @keyframes slideDownGlass {
          0% { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </div>
  );
}