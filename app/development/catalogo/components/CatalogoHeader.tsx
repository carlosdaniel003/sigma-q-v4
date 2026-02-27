"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export function CatalogoHeader({ title }: { title: string }) {
  return (
    <div className="header-glass-wrapper fade-in">
      <div className="header-glass-pill">
        <div className="icon-wrapper">
          <BookOpen size={22} className="text-brand" />
        </div>
        <h2 className="header-title">
          {title}
        </h2>
      </div>

      {/* ✅ CSS ISOLADO (SCOPED) COM APPLE GLASSMORPHISM */}
      <style jsx>{`
        /* --- Container --- */
        .header-glass-wrapper {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }

        /* --- Cápsula de Vidro (Pill) --- */
        .header-glass-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 24px 14px 14px;
          overflow: hidden;
          
          /* Apple iPhone Liquid Glass */
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.6),
            rgba(30, 41, 59, 0.3)
          );
          backdrop-filter: blur(45px) saturate(150%);
          -webkit-backdrop-filter: blur(45px) saturate(150%);
          
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 100px; /* Arredondamento total em formato pílula */
          
          box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
            
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Reflexo em Movimento (Sweep) */
        .header-glass-pill::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.9s ease;
          pointer-events: none;
          z-index: 1;
        }

        .header-glass-pill:hover::before {
          left: 200%;
        }

        .header-glass-pill:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(96, 165, 250, 0.3);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(59, 130, 246, 0.15);
        }

        /* --- Bloco do Ícone --- */
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .text-brand {
          color: #60a5fa;
        }

        .header-glass-pill:hover .icon-wrapper {
          background: rgba(59, 130, 246, 0.25);
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }

        /* --- Título com Gradiente Textual --- */
        .header-title {
          position: relative;
          z-index: 2;
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          
          /* Efeito de texto metálico/brilhante */
          background: linear-gradient(to right, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
        }

        /* --- Animação de Entrada --- */
        .fade-in {
          animation: slideDownGlass 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes slideDownGlass {
          0% { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
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