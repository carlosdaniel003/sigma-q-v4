"use client";

import "./ppm-ocorrencias-glass.css";
import React from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

interface Props {
  data: Record<string, number>;
  onClickCode?: (code: string) => void;
}

function normalizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

const CANONICAL_CODES: Record<string, string> = {
  A: "A", RC: "RC", AFRET: "AF RET", FF: "FF", VER: "VER",
  INTMOD: "INT MOD", RT: "RT", OC: "OC", AN: "AN", AC: "AC",
  F: "F", FL: "FL", P: "P", PS: "PS", REVISAO: "REVISÃO", RV: "RV", T: "T",
};

export default function PpmOcorrenciasBreakdown({ data, onClickCode }: Props) {
  const aggregated: Record<string, number> = {};

  Object.entries(data).forEach(([rawCode, qtd]) => {
    const normalized = normalizeCode(rawCode);
    const canonical = CANONICAL_CODES[normalized] || normalized;
    aggregated[canonical] = (aggregated[canonical] || 0) + qtd;
  });

  const sorted = Object.entries(aggregated).sort(
    ([, a], [, b]) => b - a
  );

  if (sorted.length === 0) return null;

  return (
    <div className="occurrence-card fade-in">
      <div className="section-header">
        <div className="section-title-wrapper">
          <Squares2X2Icon width={20} />
          <h2 className="section-title">
            Detalhamento de Ocorrências
          </h2>
        </div>
      </div>

      <div className="grid-list">
        {sorted.map(([code, qtd]) => (
          <div 
              key={code} 
              className="breakdown-item"
              onClick={() => onClickCode && onClickCode(code)}
              style={{ 
                  cursor: onClickCode ? "pointer" : "default",
                  transition: "background 0.2s"
              }}
              onMouseEnter={(e) => { if(onClickCode) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={(e) => { if(onClickCode) e.currentTarget.style.background = "transparent" }}
          >
            <span className="breakdown-code">{code}</span>
            <span className="breakdown-value">
              {qtd.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}