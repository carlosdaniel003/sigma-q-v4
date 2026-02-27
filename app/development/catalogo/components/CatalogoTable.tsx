import React from "react";

export function CatalogoTable({ title, dados }: any) {
  if (!dados || dados.length === 0) return null;

  // Pega as chaves do primeiro item para definir as colunas
  const colunas = Object.keys(dados[0]);

  return (
    <div className="catalogo-scope">
      
      {/* Título com detalhe visual */}
      <div className="header-wrapper">
        <h3 className="catalogo-title">{title}</h3>
        <span className="badge-count">{dados.length} itens</span>
      </div>

      {/* ✅ SEPARAÇÃO: Apenas gere o vidro e esconde os brilhos fora da caixa */}
      <div className="catalogo-glass-container">
        
        {/* ✅ O Scroll fica APENAS aqui dentro, isolado do brilho */}
        <div className="catalogo-table-scroll custom-scrollbar">
          <table className="premium-table">
            <thead>
              <tr>
                {colunas.map((c) => (
                  <th key={c}>
                    {c.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dados.map((linha: any, i: number) => (
                <tr key={i} className="table-row">
                  {colunas.map((colunaKey) => (
                    <td key={`${i}-${colunaKey}`}>
                      {String(linha[colunaKey] ?? "")} 
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ CSS ISOLADO (SCOPED) COM APPLE GLASSMORPHISM CORRIGIDO */}
      <style jsx>{`
        /* --- Container --- */
        .catalogo-scope {
          margin-top: 32px;
          margin-bottom: 48px;
          animation: slideUpGlass 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        /* --- Header --- */
        .header-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-left: 8px;
        }

        .catalogo-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.02em;
          margin: 0;
          border-left: 4px solid #60a5fa;
          padding-left: 12px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .badge-count {
          font-size: 0.75rem;
          background: rgba(59, 130, 246, 0.15);
          color: #93c5fd;
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 700;
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
        }

        /* --- Glass Container (Gere APENAS o visual Premium) --- */
        .catalogo-glass-container {
          position: relative;
          width: 100%;
          
          /* Oculta os excessos do ::before para não criar Scroll Fantasma */
          overflow: hidden; 
          
          /* O segredo do Liquid Glass */
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.6),
            rgba(30, 41, 59, 0.4)
          );
          backdrop-filter: blur(45px) saturate(150%);
          -webkit-backdrop-filter: blur(45px) saturate(150%);
          
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px; /* Cantos arredondados padrão iOS */
          
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        /* Efeito de Reflexo Animado na Borda Superior (Sweep) */
        .catalogo-glass-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 1.2s ease-in-out;
          pointer-events: none; /* Não bloqueia cliques */
          z-index: 1; /* Fica por baixo da tabela */
        }

        .catalogo-glass-container:hover::before {
          left: 200%;
        }

        /* --- Scroll isolado para a tabela --- */
        .catalogo-table-scroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          position: relative;
          z-index: 2; /* Fica acima do reflexo */
        }

        /* --- Tabela --- */
        .premium-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 100%;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        /* --- Cabeçalho (TH) --- */
        .premium-table th {
          background: rgba(2, 6, 23, 0.4);
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          
          text-align: left;
          padding: 20px 24px;
          
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
          position: sticky;
          top: 0;
          backdrop-filter: blur(12px);
        }

        /* --- Células (TD) --- */
        .premium-table td {
          color: #cbd5e1;
          font-size: 0.85rem;
          line-height: 1.6;
          
          text-align: left;
          padding: 16px 24px;
          vertical-align: top;
          
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.25s ease;
        }

        /* Primeira Coluna (Código/ID) */
        .premium-table td:first-child {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #60a5fa; 
          font-weight: 600;
          font-size: 0.8rem;
          white-space: nowrap;
          width: 1%;
          background: rgba(59, 130, 246, 0.03); 
        }

        /* --- Linhas (TR) --- */
        .table-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .table-row:last-child td {
          border-bottom: none;
        }

        /* Hover Effect Premium */
        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .table-row:hover td {
          color: #ffffff; 
        }

        .table-row:hover td:first-child {
          color: #93c5fd;
          background: rgba(59, 130, 246, 0.1);
        }

        /* --- Scrollbar Customizada (Fina e Discreta) --- */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin: 0 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* --- Animação (Spring/Mola) --- */
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
      `}</style>
    </div>
  );
}