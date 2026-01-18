/**
 * Script auxiliar para formatar a string de conexão do MongoDB Atlas
 * 
 * Uso: node scripts/format-connection-string.js
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function urlEncodePassword(password) {
  // Caracteres que precisam ser codificados na URL
  const specialChars = {
    '@': '%40',
    '#': '%23',
    '$': '%24',
    '%': '%25',
    '&': '%26',
    '+': '%2B',
    '=': '%3D',
    '?': '%3F',
    '/': '%2F',
    ':': '%3A'
  };

  let encoded = '';
  for (const char of password) {
    encoded += specialChars[char] || char;
  }
  return encoded;
}

async function main() {
  console.log('\n🚀 FORMATADOR DE STRING DE CONEXÃO MONGODB ATLAS\n');
  console.log('Este script ajuda a criar a string de conexão correta.\n');

  // Solicitar dados
  const clusterUrl = await question('🌐 Cole a URL do cluster (ex: cluster0.xxxxx.mongodb.net): ');
  const username = await question('👤 Usuário do banco de dados: ');
  const password = await question('🔐 Senha do banco de dados: ');
  const databaseName = await question('📊 Nome do banco de dados (padrão: insane-pay): ') || 'insane-pay';

  // Codificar senha se necessário
  const encodedPassword = urlEncodePassword(password);

  // Montar string de conexão
  const connectionString = `mongodb+srv://${username}:${encodedPassword}@${clusterUrl}/${databaseName}?retryWrites=true&w=majority`;

  console.log('\n✅ STRING DE CONEXÃO GERADA:\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(connectionString);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 Para usar, adicione ao arquivo .env:');
  console.log(`MONGODB_URI=${connectionString}\n`);

  rl.close();
}

main().catch(console.error);

