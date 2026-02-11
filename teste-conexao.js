const mysql = require('mysql2');

// Configuração baseada nos prints que a TI mandou
const connection = mysql.createConnection({
  host: '10.110.100.227', // O IP é mais seguro que o nome 'SRMKEAWS006'
  user: 'sysweb',         // Usuário do print
  password: '',           // Senha vazia conforme o código PHP da TI
  database: 'qualitycontrol',
  port: 3306
});

console.log('⏳ Tentando conectar ao banco qualitycontrol...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Erro de conexão:', err.code);
    console.error('Detalhes:', err.message);
    return;
  }
  console.log('✅ SUCESSO! Conectado ao banco de dados.');

  // Vamos tentar buscar 1 registro para ter certeza absoluta
  connection.query('SELECT * FROM tb_conserto LIMIT 1', (err, rows) => {
    if (err) {
      console.error('❌ Conectou, mas deu erro na query:', err.message);
    } else {
      console.log('✅ Dados recebidos do banco 2026!');
      console.log('Exemplo de registro:', rows[0]);
    }
    connection.end();
  });
});