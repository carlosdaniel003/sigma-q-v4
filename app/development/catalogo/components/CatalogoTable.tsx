import React from "react";

export function CatalogoTable({ title, dados }: any) {
  if (!dados || dados.length === 0) return null;

  // Pega as chaves do primeiro item para definir as colunas
  const colunas = Object.keys(dados[0]);

  return (
    <div className="catalogo-scope fade-in">
      
      {/* Título com detalhe visual */}
      <div className="header-wrapper">
        <h3 className="catalogo-title">{title}</h3>
        <span className="badge-count">{dados.length} itens</span>
      </div>

      <div className="catalogo-table-wrapper custom-scrollbar">
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

      {/* ✅ CSS ISOLADO (SCOPED) */}
      <style jsx>{`
        /* --- Container --- */
        .catalogo-scope {
          margin-top: 32px;
          margin-bottom: 48px;
          animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
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
          color: #f1f5f9;
          letter-spacing: 0.02em;
          margin: 0;
          /* Detalhe Neon na esquerda */
          border-left: 4px solid #3b82f6;
          padding-left: 12px;
        }

        .badge-count {
          font-size: 0.75rem;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        /* --- Table Wrapper (Glassmorphism) --- */
        .catalogo-table-wrapper {
          width: 100%;
          overflow-x: auto;
          
          background: rgba(15, 23, 42, 0.6); /* Fundo escuro semi-transparente */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
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
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          
          text-align: left;
          padding: 18px 24px;
          
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(12px); /* Header fica "frosted" ao rolar */
        }

        /* --- Células (TD) --- */
        .premium-table td {
          color: #e2e8f0;
          font-size: 0.9rem;
          line-height: 1.6;
          
          text-align: left;
          padding: 16px 24px;
          vertical-align: top;
          
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: color 0.2s;
        }

        /* Primeira Coluna (Código/ID) */
        .premium-table td:first-child {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #60a5fa; /* Azul Neon */
          font-weight: 600;
          font-size: 0.85rem;
          white-space: nowrap;
          width: 1%;
        }

        /* --- Linhas (TR) --- */
        .table-row {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .table-row:last-child td {
          border-bottom: none;
        }

        /* Hover Effect Premium */
        .table-row:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-1px); /* Leve levitação */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .table-row:hover td {
          color: #ffffff; /* Texto brilha no hover */
        }

        /* --- Scrollbar Customizada --- */
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          border: 2px solid rgba(0, 0, 0, 0.2); /* Cria margem interna */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* --- Animação --- */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}