import React from "react";
// Opcional: importe o CSS se ele não estiver importado no layout/page principal
// import "../GestaoLotes-glass.css"; 

export default function GestaoLotesHeader() {
  return (
    <header className="gl-header-glass">
      <h2 className="gl-page-title">
        Gestão de Lotes
        <span className="gl-header-badge">
          Auditoria de Produção
        </span>
      </h2>
      <p className="gl-header-subtitle">
        Filtre e oculte lotes de produção (testes de engenharia, duplicatas) para não impactarem o cálculo de PPM.
      </p>
    </header>
  );
}