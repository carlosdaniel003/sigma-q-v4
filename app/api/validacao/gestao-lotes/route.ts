import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Caminho absoluto para o arquivo JSON na raiz do seu projeto
const DB_FILE_PATH = path.join(process.cwd(), "lotes_ignorados.json");

// Função auxiliar para ler o arquivo JSON com segurança
function readIgnoredLots() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // Se não existir, cria um arquivo vazio com um array
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([]), "utf-8");
      return [];
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler lotes_ignorados.json:", error);
    return [];
  }
}

// Função auxiliar para salvar no arquivo JSON
function writeIgnoredLots(data: any[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Erro ao escrever em lotes_ignorados.json:", error);
    return false;
  }
}

// ============================================================================
// [GET] - Retorna a lista de IDs ignorados
// ============================================================================
export async function GET() {
  const ignoredLots = readIgnoredLots();
  return NextResponse.json({ success: true, ignorados: ignoredLots });
}

// ============================================================================
// [POST] - Adiciona novos lotes à lista de ignorados (Ocultar)
// ============================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, motivo, usuario } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "Nenhum ID fornecido." }, { status: 400 });
    }

    const currentIgnored = readIgnoredLots();
    const newEntries = [];

    // Adiciona apenas os IDs que já não estão na lista
    for (const id of ids) {
      const alreadyIgnored = currentIgnored.find((item: any) => item.id === String(id));
      if (!alreadyIgnored) {
        newEntries.push({
          id: String(id),
          motivo: motivo || "Sem justificativa",
          usuario: usuario || "Admin",
          data_ocultacao: new Date().toISOString()
        });
      }
    }

    if (newEntries.length > 0) {
      const updatedList = [...currentIgnored, ...newEntries];
      writeIgnoredLots(updatedList);
    }

    return NextResponse.json({ success: true, message: `${newEntries.length} lotes ocultados com sucesso.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro interno no servidor." }, { status: 500 });
  }
}

// ============================================================================
// [DELETE] - Remove lotes da lista de ignorados (Restaurar)
// ============================================================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "Nenhum ID fornecido." }, { status: 400 });
    }

    const currentIgnored = readIgnoredLots();
    
    // Filtra mantendo apenas os que NÃO estão no array de IDs recebido
    const updatedList = currentIgnored.filter((item: any) => !ids.includes(String(item.id)));
    
    writeIgnoredLots(updatedList);

    return NextResponse.json({ success: true, message: `Lotes restaurados com sucesso.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro interno no servidor." }, { status: 500 });
  }
}