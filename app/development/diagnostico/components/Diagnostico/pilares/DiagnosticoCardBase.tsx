import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Info, AlertOctagon } from "lucide-react";
import { InsightCard } from "../../../hooks/diagnosticoTypes";

interface BaseProps {
  data: InsightCard | null;
  // Permite sobrescrever o ícone ou cor se um pilar específico precisar no futuro
  customIcon?: React.ElementType; 
}

export function DiagnosticoCardBase({ data, customIcon }: BaseProps) {
  // Se não tem dados, o componente não renderiza nada (não ocupa espaço)
  if (!data) return null;

  // Mapa de Estilos por Tipo
  const styles = {
    CRITICO: {
      borderColor: "rgba(239, 68, 68, 0.5)", // Vermelho
      bgHeader: "rgba(239, 68, 68, 0.1)",
      textColor: "#fca5a5",
      Icon: AlertOctagon
    },
    ALERTA: {
      borderColor: "rgba(245, 158, 11, 0.5)", // Laranja/Amarelo
      bgHeader: "rgba(245, 158, 11, 0.1)",
      textColor: "#fcd34d",
      Icon: AlertTriangle
    },
    MELHORIA: {
      borderColor: "rgba(34, 197, 94, 0.5)", // Verde
      bgHeader: "rgba(34, 197, 94, 0.1)",
      textColor: "#86efac",
      Icon: TrendingDown // Seta pra baixo em defeitos é bom
    },
    INFO: {
      borderColor: "rgba(59, 130, 246, 0.5)", // Azul
      bgHeader: "rgba(59, 130, 246, 0.1)",
      textColor: "#93c5fd",
      Icon: Info
    }
  };

  const currentStyle = styles[data.tipo] || styles.INFO;
  const IconToRender = customIcon || currentStyle.Icon;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${currentStyle.borderColor}`,
        borderRadius: "12px",
        marginBottom: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.5s ease-in-out"
      }}
    >
      {/* Cabeçalho do Card */}
      <div
        style={{
          background: currentStyle.bgHeader,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: `1px solid ${currentStyle.borderColor}`
        }}
      >
        <IconToRender size={18} color={currentStyle.textColor} />
        <span
          style={{
            color: currentStyle.textColor,
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          {data.titulo}
        </span>
      </div>

      {/* Corpo do Texto */}
      <div style={{ padding: "16px" }}>
        <p style={{ 
          margin: 0, 
          fontSize: "0.9rem", 
          lineHeight: "1.5", 
          color: "#e2e8f0" 
        }}>
          {/* Renderiza negrito se houver markdown simples de ** */}
          {data.descricao.split("**").map((part, i) => 
            i % 2 === 1 ? <strong key={i} style={{ color: "#fff" }}>{part}</strong> : part
          )}
        </p>
      </div>
      
      {/* Animação CSS inline para garantir suavidade */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}