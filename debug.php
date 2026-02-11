<?php
// --- 1. FORÇAR A EXIBIÇÃO DE ERROS (O "Dedo-Duro") ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: text/html; charset=UTF-8");

echo "<h1> Painel de Diagnóstico SIGMA</h1>";
echo "<p>Status: O PHP está rodando!</p>";

// --- 2. CONFIGURAÇÃO (Vamos tentar 'localhost' primeiro) ---
// Motivo: O script já está DENTRO do servidor. Chamar o IP externo pode ser bloqueado.
$host = 'SRMKEAWS006'; 
$user = 'sysweb';
$pass = '';
$db   = 'qualitycontrol';

echo "Attempting connection to: <strong>$host</strong> (User: $user)...<br><hr>";

// --- 3. TESTE DE CONEXÃO ---
try {
    $mysqli = new mysqli($host, $user, $pass, $db);

    if ($mysqli->connect_errno) {
        echo "<h2 style='color:red'> FALHA NA CONEXÃO</h2>";
        echo "<strong>Erro Código:</strong> " . $mysqli->connect_errno . "<br>";
        echo "<strong>Mensagem:</strong> " . $mysqli->connect_error . "<br>";
        
        echo "<br><em>Dica: Se falhou com 'localhost', tente mudar a variável \$host para 'SRMKEAWS006' ou '127.0.0.1'.</em>";
    } else {
        echo "<h2 style='color:green'> SUCESSO! CONECTADO.</h2>";
        echo "Info do Host: " . $mysqli->host_info . "<br>";
        
        // --- 4. TESTE DE LEITURA ---
        echo "<hr>Tentando ler 1 registro da tabela 'tb_conserto'...<br>";
        $sql = "SELECT * FROM tb_conserto LIMIT 1";
        $result = $mysqli->query($sql);

        if ($result) {
            $row = $result->fetch_assoc();
            echo "<pre style='background:#f4f4f4; padding:10px; border:1px solid #ccc'>";
            print_r($row);
            echo "</pre>";
            echo "<strong>Conclusão:</strong> A ponte está pronta para uso!";
        } else {
            echo "<h3 style='color:orange'> Conectou, mas a query falhou.</h3>";
            echo "Erro SQL: " . $mysqli->error;
        }
    }
} catch (Exception $e) {
    echo "<h2 style='color:red'> ERRO CRÍTICO (Exception)</h2>";
    echo $e->getMessage();
}
?>