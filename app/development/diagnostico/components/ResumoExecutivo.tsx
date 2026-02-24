import React from "react";

/* ======================================================
   FUNÇÃO HIGHLIGHT: Transforma o **texto** em negrito
====================================================== */
function renderHighlightedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong
          key={index}
          style={{
            color: "#38bdf8", // Azul para os dados
            fontWeight: 700,
            letterSpacing: "0.02em"
          }}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    }
    return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
  });
}

export default function ResumoExecutivo({ dados }: { dados: any }) {
  if (!dados) return null;

  return (
    <div style={{ 
        fontSize: "0.95rem", 
        lineHeight: 1.8, 
        color: "#e2e8f0", 
        display: "flex", 
        flexDirection: "column", 
        gap: 16 
    }}>
      
      {/* BLOCO 1: Contexto */}
      {dados.contexto && (
        <p style={{ margin: 0 }}>
          {renderHighlightedText(dados.contexto)}
        </p>
      )}

      {/* BLOCO 2: Análise de Tendência */}
      {dados.tendenciaInfo && dados.tendenciaInfo.texto && (
        <p style={{ margin: 0 }}>
          {renderHighlightedText(dados.tendenciaInfo.texto)}
        </p>
      )}

      {/* BLOCO 3: Ação Recomendada (Ishikawa) */}
      {dados.acaoRecomendada && (
        <p style={{ margin: 0 }}>
          {renderHighlightedText(dados.acaoRecomendada)}
        </p>
      )}

      {/* BLOCO 4: Histórico & Lições Aprendidas (Buscado do Excel de 2025) */}
      {dados.licaoAprendida && (
        <div style={{
          marginTop: 4,
          paddingTop: 16,
          borderTop: "1px dashed rgba(255,255,255,0.1)",
          color: "#d8b4fe" // Tom levemente roxo/lilás para destacar o histórico
        }}>
          <p style={{ margin: 0 }}>
            {renderHighlightedText(dados.licaoAprendida)}
          </p>
        </div>
      )}

    </div>
  );
}