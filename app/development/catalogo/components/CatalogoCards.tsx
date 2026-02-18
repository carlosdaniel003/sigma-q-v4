import React from "react";

export function CatalogoCards({ onSelect }: any) {
  return (
    <>
      <div className="cards-grid fade-in">
        <div className="card-btn" onClick={() => onSelect("modelos")}>
          <span className="card-text">Modelos</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("causas")}>
          <span className="card-text">Causas</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("responsabilidades")}>
          <span className="card-text">Responsabilidades</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("defeitos")}>
          <span className="card-text">Defeitos</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("fmea")}>
          <span className="card-text">FMEA</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("excecoes")}>
          <span className="card-text">Exceções</span>
          <div className="card-glow" />
        </div>
        <div className="card-btn" onClick={() => onSelect("agrupamentos")}>
          <span className="card-text">Agrupamento</span>
          <div className="card-glow" />
        </div>
      </div>

      <style jsx>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 10px;
          width: 100%;
        }

        .card-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 110px;
          padding: 20px;
          overflow: hidden;
          
          /* Glassmorphism Profundo (Compatível com CatalogoTable) */
          background: rgba(15, 23, 42, 0.4); 
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          user-select: none;
        }

        .card-text {
          position: relative;
          z-index: 2;
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        /* Efeito de Brilho Interno (Glow) */
        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        /* Efeito de Hover */
        .card-btn:hover {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(59, 130, 246, 0.5); /* Borda Azul Neon igual à tabela */
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4), 
                      0 0 15px rgba(59, 130, 246, 0.2);
        }

        .card-btn:hover .card-text {
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }

        .card-btn:hover .card-glow {
          opacity: 1;
        }

        /* Animação de Seleção (Click) */
        .card-btn:active {
          transform: scale(0.95) translateY(0);
          background: rgba(59, 130, 246, 0.2);
          transition: 0.1s;
        }

        /* Animação de Entrada */
        .fade-in {
          animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Responsividade para telas menores */
        @media (max-width: 600px) {
          .card-btn {
            height: 90px;
          }
          .card-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}