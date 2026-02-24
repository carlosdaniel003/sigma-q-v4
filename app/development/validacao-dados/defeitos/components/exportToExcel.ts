import * as XLSX from 'xlsx';

export async function baixarComoExcel(nomeDoArquivo: string) {
    try {
        // Agora o navegador pede para o próprio Next.js, escapando do bloqueio de CORS!
        const response = await fetch('/api/exportar-excel', { 
            cache: 'no-store' 
        });

        if (!response.ok) {
            throw new Error(`Erro de conexão com a API interna: ${response.status}`);
        }

        const dadosJson = await response.json();

        // Valida se a API retornou a lista certinha
        if (!Array.isArray(dadosJson)) {
            alert("Erro: O formato recebido do servidor não é uma lista válida.");
            console.error("Retorno não é array:", dadosJson);
            return;
        }

        if (dadosJson.length === 0) {
            alert("Não há dados no banco para exportar.");
            return;
        }

        // Converte o JSON em Planilha do Excel
        const worksheet = XLSX.utils.json_to_sheet(dadosJson);
        
        // Cria o Arquivo e anexa a aba
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Brutos SIGMA");
        
        // Baixa o arquivo XLSX
        XLSX.writeFile(workbook, `${nomeDoArquivo}.xlsx`);

    } catch (error) {
        console.error("Erro na exportação para Excel:", error);
        alert("Ocorreu um erro ao tentar gerar o arquivo Excel.");
    }
}