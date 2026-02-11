<?php
// Permite que seu localhost acesse este arquivo (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// --- AQUI ESTÁ A MUDANÇA ---
// Em vez de definir SENHA, USER, HOST...
// Nós "puxamos" a configuração pronta da empresa.
// Tente estas opções de caminho (uma de cada vez se der erro):
if (file_exists("conexao.php")) {
    include("conexao.php");
} elseif (file_exists("../conexao.php")) {
    include("../conexao.php");
} elseif (file_exists("../../conexao.php")) {
    include("../../conexao.php");
} else {
    // Se não achar o arquivo, morre aqui
    http_response_code(500);
    echo json_encode(["erro" => "Arquivo conexao.php não encontrado no servidor."]);
    exit;
}

// O código da TI cria a variável $conexao1, então vamos usar ela
// Verificamos se ela existe
if (!isset($conexao1) || !$conexao1) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha na conexão herdada: " . mysqli_connect_error()]);
    exit;
}

// Força UTF-8 para não quebrar acentos
mysqli_set_charset($conexao1, "utf8");

// QUERY: Traz tudo de 2026 para frente
$sql = "SELECT * FROM tb_conserto WHERE data_criacao >= '2026-01-01' ORDER BY id DESC";

// Note que agora usamos $conexao1
$resultado = mysqli_query($conexao1, $sql);
$dados = array();

if ($resultado) {
    while ($linha = mysqli_fetch_assoc($resultado)) {
        $dados[] = $linha;
    }
} else {
    $dados = ["erro" => "Erro na query: " . mysqli_error($conexao1)];
}

echo json_encode($dados);
?>