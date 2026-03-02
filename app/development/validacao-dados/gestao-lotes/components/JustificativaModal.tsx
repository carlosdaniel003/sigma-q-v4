import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function JustificativaModal({ 
  show, onClose, onConfirm, motivo, setMotivo, selectedCount 
}: any) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(10px)"
    }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))",
        border: "1px solid rgba(255,255,255,0.1)", padding: 32, borderRadius: 24, width: 400,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={20} /> Ocultar {selectedCount} lotes
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: 20 }}>
          Por que estes lotes estão sendo removidos do cálculo de Qualidade?
        </p>
        <input 
          type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Peças de engenharia, duplicado..." 
          style={{
            width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 16px", borderRadius: 12, color: "#fff", outline: "none", marginBottom: 24
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer" }}>
            Cancelar
          </button>
          <button 
            onClick={onConfirm} disabled={!motivo.trim()}
            style={{ padding: "10px 16px", borderRadius: 10, background: motivo.trim() ? "#ef4444" : "rgba(239,68,68,0.3)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}