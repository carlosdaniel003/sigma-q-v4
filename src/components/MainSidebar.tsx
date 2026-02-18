// src/components/MainSidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isGuestUser } from "@/core/session/userSession";
// ✅ Importamos o novo monitor global
import { useGlobalValidationMonitor } from "@/hooks/useGlobalValidationMonitor";

import {
  BookOpenIcon,
  ShieldCheckIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronDownIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function MainSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [guest, setGuest] = useState(true);
  const [openValidacao, setOpenValidacao] = useState(false);
  
  // ✅ ATIVA O MONITORAMENTO SILENCIOSO ASSIM QUE A SIDEBAR CARREGA
  useGlobalValidationMonitor();

  // ✅ ESTADOS DE ALERTA: Monitoramento individual das 3 bases
  const [alerts, setAlerts] = useState({
    defeitos: false,
    producao: false,
    ppm: false
  });

  // Alerta global: verdadeiro se QUALQUER base estiver com erro
  const hasAnyAlert = alerts.defeitos || alerts.producao || alerts.ppm;

  useEffect(() => {
    setGuest(isGuestUser());
    setMounted(true);

    // Função para ler o estado atual do LocalStorage
    const checkAlerts = () => {
      setAlerts({
        defeitos: localStorage.getItem("sigma_validation_alert") === "true",
        producao: localStorage.getItem("sigma_validation_alert_producao") === "true",
        ppm: localStorage.getItem("sigma_validation_alert_ppm") === "true"
      });
    };

    // 1. Checa imediatamente ao montar
    checkAlerts();

    // 2. Escuta o evento disparado pelo Hook Global e pelas páginas de validação
    window.addEventListener("sigma_alert_changed", checkAlerts);
    
    // 3. Reforço: Checa quando a janela ganha foco (ex: usuário voltou de outra aba)
    window.addEventListener("focus", checkAlerts);

    return () => {
        window.removeEventListener("sigma_alert_changed", checkAlerts);
        window.removeEventListener("focus", checkAlerts);
    };
  }, []);

  useEffect(() => {
    if (pathname.includes("/development/validacao-dados")) {
      setOpenValidacao(true);
    }
  }, [pathname]);

  if (!mounted || guest) return null;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  const isValidacaoActive = isActive("/development/validacao-dados");

  return (
    <>
      {/* ✅ ANIMAÇÕES DE PULSAR (NEON) */}
      <style jsx>{`
        @keyframes pulseAlert {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.7); border-color: rgba(239, 68, 68, 0.7); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.4); }
        }
        .nav-pulse-alert {
          animation: pulseAlert 2.5s infinite;
          background-color: rgba(239, 68, 68, 0.05) !important;
          color: #fca5a5 !important;
        }
        .nav-pulse-alert .nav-icon {
          color: #ef4444 !important;
        }
        .pulse-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          background-color: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseAlert 2.5s infinite;
        }
      `}</style>

      <aside
        className={`dev-sidebar ${collapsed ? "collapsed" : ""}`}
        style={{ width: collapsed ? "80px" : "260px" }}
      >
        {/* ======================================================
            1️⃣ HEADER — TOGGLE + LOGO
        ====================================================== */}
        <div className="sidebar-header">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Bars3Icon /> : <Bars3BottomLeftIcon />}
          </button>

          {!collapsed && <div className="dev-logo fade-in">SIGMA-Q</div>}
        </div>

        {/* ======================================================
            2️⃣ NAVEGAÇÃO — CARDS
        ====================================================== */}
        <div className="nav-section">
          {/* DASHBOARD */}
          <Link
            href="/dashboard"
            className={`nav-card ${isActive("/dashboard") ? "active" : ""}`}
          >
            <Squares2X2Icon className="nav-icon" />
            {!collapsed && <span className="text">Dashboard</span>}
          </Link>

          {/* 🔍 DIAGNÓSTICO IA */}
          <Link
            href="/development/diagnostico"
            className={`nav-card ${
              isActive("/development/diagnostico") ? "active" : ""
            }`}
          >
            <CpuChipIcon className="nav-icon" />
            {!collapsed && <span className="text">Diagnóstico IA</span>}
          </Link>

          {/* CATÁLOGO */}
          <Link
            href="/development/catalogo"
            className={`nav-card ${
              isActive("/development/catalogo") ? "active" : ""
            }`}
          >
            <BookOpenIcon className="nav-icon" />
            {!collapsed && <span className="text">Catálogo Oficial</span>}
          </Link>

          {/* ======================================================
              VALIDAÇÃO DE DADOS (COM SUBMENU)
          ====================================================== */}
          <div className="nav-group">
            <div
              className={`nav-card ${
                isValidacaoActive ? "active-parent" : ""
              } ${hasAnyAlert && !isValidacaoActive ? "nav-pulse-alert" : ""}`}
              onClick={() => {
                if (collapsed) setCollapsed(false);
                setOpenValidacao(!openValidacao);
              }}
            >
              <TableCellsIcon className="nav-icon" />
              {!collapsed && (
                <>
                  <span className="text" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    Validação de Dados
                    {/* Alerta minimalista se o menu estiver fechado ou recolhido */}
                    {hasAnyAlert && !openValidacao && <span className="pulse-dot" style={{ marginLeft: 8 }}></span>}
                  </span>
                  <ChevronDownIcon
                    className={`chevron-icon ${
                      openValidacao ? "rotate" : ""
                    }`}
                  />
                </>
              )}
              {collapsed && hasAnyAlert && (
                 <div style={{ position: "absolute", top: 8, right: 8 }} className="pulse-dot"></div>
              )}
            </div>

            {!collapsed && openValidacao && (
              <div className="nav-submenu-pills fade-in-fast">
                {/* 1. DEFEITOS */}
                <Link
                  href="/development/validacao-dados/defeitos"
                  className={`nav-pill ${
                    isActive("/development/validacao-dados/defeitos") ? "active" : ""
                  }`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div><span className="dot">•</span> Defeitos</div>
                  {alerts.defeitos && <span className="pulse-dot"></span>}
                </Link>

                {/* 2. PRODUÇÃO */}
                <Link
                  href="/development/validacao-dados/producao"
                  className={`nav-pill ${
                    isActive("/development/validacao-dados/producao") ? "active" : ""
                  }`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div><span className="dot">•</span> Produção</div>
                  {alerts.producao && <span className="pulse-dot"></span>}
                </Link>

                {/* 3. PPM */}
                <Link
                  href="/development/validacao-dados/ppm"
                  className={`nav-pill ${
                    isActive("/development/validacao-dados/ppm") ? "active" : ""
                  }`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div><span className="dot">•</span> PPM</div>
                  {alerts.ppm && <span className="pulse-dot"></span>}
                </Link>
              </div>
            )}
          </div>

          {/* GERENCIAMENTO DE ACESSO */}
          <Link
            href="/development/acesso"
            className={`nav-card ${
              isActive("/development/acesso") ? "active" : ""
            }`}
          >
            <ShieldCheckIcon className="nav-icon" />
            {!collapsed && (
              <span className="text">Gerenciamento de Acesso</span>
            )}
          </Link>
        </div>

        {/* ======================================================
            3️⃣ FOOTER — LOGOUT
        ====================================================== */}
        <div className="sidebar-footer">
          <div
            className="logout-card"
            onClick={() => {
              localStorage.removeItem("sigma_user");
              document.cookie = "sigma_auth=; path=/; max-age=0";
              window.location.href = "/login";
            }}
          >
            <div className="logout-icon-wrapper">
              <span className="logout-initial">S</span>
            </div>
            {!collapsed && <span className="text">Sair</span>}
          </div>
        </div>
      </aside>
    </>
  );
}