"use client";

import { AlertOctagon } from "lucide-react";
import "./DefeitosCriticosNpr-glass.css"; // ✅ NOVO CSS IMPORTADO

export default function DefeitosCriticosNpr({
  data,
}: {
  data?: { 
    codigo: string;
    descricao: string;
    severidade: number;
    ocorrencia: number;
    deteccao: number;
    npr: number;
  }[];
}) {
  // ✅ SAFETY CHECK: Garante que 'lista' seja sempre um array válido
  const lista = data || [];

  return (
    <div className="npr-list-container">
      
      {/* TÍTULO */}
      <h3 className="npr-list-title">
        <AlertOctagon size={20} strokeWidth={2.5} />
        Defeitos Críticos (Top 5 NPR)
      </h3>

      {/* ESTADO VAZIO */}
      {lista.length === 0 && (
        <span className="npr-list-empty">
          Nenhum defeito crítico identificado para os filtros aplicados.
        </span>
      )}

      {/* LISTA TOP 5 */}
      {lista.map((d, i) => {
        
        // Define a classe de status baseada no valor de NPR
        const nivel = d.npr >= 40 ? "critico" : d.npr >= 25 ? "alerta" : "ok";
        const statusClass = `status-${nivel}`;

        return (
          <div key={i} className={`npr-list-item ${statusClass}`}>
            
            {/* DESCRIÇÃO E CÓDIGO */}
            <div className="npr-item-info">
              <span className="npr-item-desc">{d.descricao}</span>
              <span className="npr-item-code">Cód: {d.codigo}</span>
            </div>

            {/* SEVERIDADE */}
            <div className="npr-metric-box" title="Severidade">
              S <strong>{d.severidade}</strong>
            </div>

            {/* OCORRÊNCIA */}
            <div className="npr-metric-box" title="Ocorrência">
              O <strong>{d.ocorrencia}</strong>
            </div>

            {/* DETECÇÃO */}
            <div className="npr-metric-box" title="Detecção">
              D <strong>{d.deteccao}</strong>
            </div>

            {/* NPR FINAL */}
            <div className="npr-metric-final" title="NPR Total">
              NPR {d.npr}
            </div>

          </div>
        );
      })}
    </div>
  );
}