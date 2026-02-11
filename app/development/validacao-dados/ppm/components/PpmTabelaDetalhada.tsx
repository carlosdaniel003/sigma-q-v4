"use client";

import React from "react";
import { 
  Table, 
  CalendarClock, 
  Factory, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";

type DiagnosticoReason =
  | "OK"
  | "SEM_DEFEITOS"
  | "DADOS_INCOMPLETOS"
  | "SEM_PRODUCAO"
  | "PPM_ZERADO";

interface Item {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;
  precision: number; // mantido no tipo (pode ser usado em outros lugares)
  reason: DiagnosticoReason;

  // 🔥 DATAS DE ORIGEM
  dataProducao?: string | Date;
  dataDefeito?: string | Date;
}

interface Props {
  items: Item[];
}

/* ======================================================
   UTIL — FORMATA DATA
====================================================== */
function formatDate(value?: string | Date): string {
  if (!value) return "—";

  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR");
}

/* ======================================================
   UTIL — STATUS BADGE
====================================================== */
function StatusBadge({ reason }: { reason: DiagnosticoReason }) {
    let color = "var(--text-muted)";
    let bg = "rgba(255,255,255,0.1)";
    let icon = <HelpCircle size={12} />;
    let label = reason.replace(/_/g, " ");

    switch (reason) {
        case "OK":
            color = "var(--success)";
            bg = "rgba(34, 197, 94, 0.15)";
            icon = <CheckCircle2 size={12} />;
            break;
        case "SEM_DEFEITOS":
            color = "#86efac"; // Light Green
            bg = "rgba(134, 239, 172, 0.1)";
            icon = <CheckCircle2 size={12} />;
            break;
        case "SEM_PRODUCAO":
            color = "var(--danger)";
            bg = "rgba(239, 68, 68, 0.15)";
            icon = <AlertCircle size={12} />;
            break;
        case "PPM_ZERADO":
            color = "var(--warn)";
            bg = "rgba(234, 179, 8, 0.15)";
            icon = <AlertCircle size={12} />;
            break;
        case "DADOS_INCOMPLETOS":
            color = "var(--text-muted)";
            bg = "rgba(255, 255, 255, 0.05)";
            break;
    }

    return (
        <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            padding: '4px 8px', 
            borderRadius: 6, 
            fontSize: '0.7rem', 
            fontWeight: 600, 
            color, 
            background: bg,
            whiteSpace: 'nowrap'
        }}>
            {icon}
            {label}
        </span>
    );
}

export default function PpmTabelaDetalhada({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginTop: 20 }}>
        <Table size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Detalhamento Técnico</h3>
        <p className="muted">Nenhum registro encontrado para os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ marginTop: 20, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Table size={20} className="text-brand" />
          <h3 className="section-title" style={{ margin: 0 }}>Detalhamento Técnico de PPM</h3>
      </div>

      <div className="glass-table-container custom-scroll" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="glass-table">
          <thead style={{ position: 'sticky', top: 0, backdropFilter: 'blur(10px)', zIndex: 10 }}>
            <tr>
              {/* 🔥 DATA PRIMEIRO */}
              <th>Data Ref.</th>
              <th>Modelo</th>
              <th>Categoria</th>
              <th style={{ textAlign: 'right' }}>Produzido</th>
              <th style={{ textAlign: 'right' }}>Defeitos</th>
              <th style={{ textAlign: 'right' }}>PPM</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => {
              const isFromProducao = r.produzido > 0;
              const dataExibida = isFromProducao
                ? r.dataProducao
                : r.dataDefeito;

              const OrigemIcon = isFromProducao ? Factory : CalendarClock;
              const origemLabel = isFromProducao ? "Produção" : "Defeito";
              const origemColor = isFromProducao ? "var(--text-muted)" : "var(--danger)";

              return (
                <tr key={r.groupKey}>
                  {/* 🔥 DATA COM ORIGEM */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formatDate(dataExibida)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: origemColor, opacity: 0.8 }}>
                            <OrigemIcon size={10} />
                            {origemLabel}
                        </div>
                    </div>
                  </td>

                  <td><strong style={{ color: 'var(--text-main)' }}>{r.modelo}</strong></td>
                  <td style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.categoria}</td>

                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{r.produzido.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: r.defeitos > 0 ? 'var(--danger)' : 'inherit' }}>{r.defeitos.toLocaleString()}</td>

                  <td className="ppm-value" style={{ textAlign: 'right', fontWeight: 700 }}>
                    {r.ppm.toLocaleString()}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge reason={r.reason} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}