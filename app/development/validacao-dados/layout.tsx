"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import "../tabs.css";
import "./layout-glass.css";

import {
  SigmaValidationProvider,
  useSigmaValidation,
} from "./context/SigmaValidationProvider";

import LoaderGlobal from "./components/LoaderGlobal";

/* ======================================================
   WRAPPER COM LOADER GLOBAL
====================================================== */

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, progress } = useSigmaValidation();

  if (loading) {
    return <LoaderGlobal progress={progress} />;
  }

  return <>{children}</>;
}

/* ======================================================
   UTIL — TEXTO RELATIVO DE TEMPO
====================================================== */

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin === 1) return "há 1 minuto";
  if (diffMin < 60) return `há ${diffMin} minutos`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "há 1 hora";
  if (diffHours < 24) return `há ${diffHours} horas`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "há 1 dia" : `há ${diffDays} dias`;
}

/* ======================================================
   HEADER (TÍTULO + STATUS)
====================================================== */

function ValidacaoHeader() {
  const { ready } = useSigmaValidation();

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [relativeText, setRelativeText] = useState("");

  useEffect(() => {
    if (ready) {
      const now = new Date();
      setLastUpdate(now);
      setRelativeText(formatRelativeTime(now));
    }
  }, [ready]);

  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      setRelativeText(formatRelativeTime(lastUpdate));
    }, 60000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="glass-header">
      <h1 className="page-title">Validação de Dados</h1>

      {lastUpdate && (
        <span className="update-text">
          Atualizado {relativeText} ·{" "}
          {lastUpdate.toLocaleDateString("pt-BR")}{" "}
          {lastUpdate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

/* ======================================================
   TABS + BOTÃO DE RELOAD
====================================================== */

function TabsWithReload() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    loadDefeitos,
    loadProducao,
    loadPpm,
    reload,
    loading,
    ready,
  } = useSigmaValidation();

  const isReloading = loading && ready;

  const isPpm = pathname.startsWith("/development/validacao-dados/ppm");
  const isProducao = pathname.startsWith(
    "/development/validacao-dados/producao"
  );
  const isDefeitos =
    pathname === "/development/validacao-dados" ||
    pathname.startsWith("/development/validacao-dados/defeitos");

  useEffect(() => {
    if (isDefeitos) loadDefeitos();
    else if (isProducao) loadProducao();
    else if (isPpm) loadPpm();
  }, [isDefeitos, isProducao, isPpm, loadDefeitos, loadProducao, loadPpm]);

  return (
    <div className="tabs-glass">
      <div className="tabs-left">
        <button
          className={`tab-btn ${isDefeitos ? "active" : ""}`}
          onClick={() =>
            router.push("/development/validacao-dados/defeitos")
          }
        >
          Validação de Defeitos
        </button>

        <button
          className={`tab-btn ${isProducao ? "active" : ""}`}
          onClick={() =>
            router.push("/development/validacao-dados/producao")
          }
        >
          Validação de Produção
        </button>

        <button
          className={`tab-btn ${isPpm ? "active" : ""}`}
          onClick={() =>
            router.push("/development/validacao-dados/ppm")
          }
        >
          Validação de PPM
        </button>
      </div>

      <button
        className={`reload-btn ${isReloading ? "loading" : ""}`}
        onClick={async () => {
          await reload();
          router.refresh();
        }}
        disabled={loading}
        title="Recarregar validação atual"
      >
        <RefreshCcw size={16} />
      </button>
    </div>
  );
}

/* ======================================================
   LAYOUT PRINCIPAL
====================================================== */

export default function LayoutValidacaoDados({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SigmaValidationProvider>
      <LayoutContent>
        <div className="validacao-wrapper fade-in">
          <ValidacaoHeader />
          <TabsWithReload />
          {children}
        </div>
      </LayoutContent>
    </SigmaValidationProvider>
  );
}