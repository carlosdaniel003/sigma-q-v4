export function inferirCategoria(modelo: string, fallbackCategoriaBruta: string): string {
  const m = String(modelo).toUpperCase();

  if (m.includes("TM-1200")) return "TM";
  if (m.includes("AWS-BBS") || m.includes("BBS-01") || m.includes("BOOMBOX")) return "BBS";
  if (m.includes("CM-1000") || m.includes("CM-300") || m.includes("CM-650") || m.includes("CAIXA AMPLIFICADA CM")) return "CM";
  if (m.includes("MO-01") || m.includes("MO-02") || m.includes("MICRO-ONDAS") || m.includes("MICRO ONDAS")) return "MWO";
  if (m.includes("AWS-T2W") || m.includes("T2W-02") || m.includes("AWS-T1W") || m.includes("T1W-02") || m.includes("TORRE DE SOM AWS-T")) return "TW";
  if (m.includes("TV") || m.includes("TELEVISOR")) return "TV";
  if (m.includes("AR CONDICIONADO") || m.includes("SPLIT") || m.includes("CONDENSADOR") || m.includes("EVAPORADOR")) return "ARCON";
  if (m.includes("PLACA") || m.includes("PCI") || m.includes("PCBA")) return "HW";

  return String(fallbackCategoriaBruta || "").trim().toUpperCase();
}