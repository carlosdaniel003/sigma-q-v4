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
          
          /* Apple iPhone Liquid Glass */
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.6),
            rgba(30, 41, 59, 0.2)
          );
          backdrop-filter: blur(45px) saturate(150%);
          -webkit-backdrop-filter: blur(45px) saturate(150%);
          
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
            
          user-select: none;
        }

        /* O reflexo varrendo a tela (Sweep) */
        .card-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: skewX(-20deg);
          transition: 0.9s ease;
          z-index: 1;
        }

        .card-btn:hover::before {
          left: 150%;
        }

        .card-text {
          position: relative;
          z-index: 2;
          color: #c5c5c5;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        /* Brilho interno dinâmico */
        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        /* Efeito Premium no Hover */
        .card-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(96, 165, 250, 0.4); /* Borda Azul Neon */
          transform: translateY(-6px) scale(1.02);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5), 
            0 0 20px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .card-btn:hover .card-text {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
        }

        .card-btn:hover .card-glow {
          opacity: 1;
        }

        /* Efeito de Clique (Press) Apple-like */
        .card-btn:active {
          transform: scale(0.96) translateY(0);
          background: rgba(59, 130, 246, 0.15);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.1s ease;
        }

        /* Animação Spring de Entrada */
        .fade-in {
          animation: slideUpGlass 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes slideUpGlass {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
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
    </> /* ✅ CORREÇÃO: Fechando corretamente com Fragmento! */
  );
}