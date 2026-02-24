import { NextResponse } from "next/server";
import { fetchDefeitosFromSQL } from "@/core/data/dataAdapter";

// Impede que o Next.js faça cache, pegando sempre o dado atualizado
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        // Traz todos os defeitos do banco, passando por todo aquele filtro
        // anti-fantasma e deduplicação que criamos no dataAdapter!
        const dadosLimpos = await fetchDefeitosFromSQL("Todos", true);
        
        return NextResponse.json(dadosLimpos);
    } catch (error) {
        console.error("❌ Erro na rota de exportação:", error);
        return NextResponse.json({ error: "Falha ao buscar dados" }, { status: 500 });
    }
}