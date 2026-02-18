import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    // Caminho absoluto para o arquivo JSON baseado na raiz do projeto
    const jsonPath = path.join(
      process.cwd(),
      "app",
      "development",
      "catalogo",
      "data",
      "agrupamento.json"
    );

    // Verifica se o arquivo existe
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json([], { status: 404 });
    }

    // Lê e retorna o conteúdo
    const fileContents = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao ler agrupamento.json:", error);
    return NextResponse.json([], { status: 500 });
  }
}