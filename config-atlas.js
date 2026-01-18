/**
 * Script para configurar MongoDB Atlas
 * Execute: node config-atlas.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// String base do Atlas
const BASE_CONNECTION_STRING = 'mongodb+srv://insane-pay-admin:<db_password>@clustero.ozs33pi.mongodb.net/insane-pay?retryWrites=true&w=majority&appName=Cluster0';

function urlEncodePassword(password) {
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

function updateEnvFile(password) {
  const envPath = path.join(__dirname, '.env');
  
  // Ler .env atual
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Codificar senha se necessário
  const encodedPassword = urlEncodePassword(password);

  // Criar string de conexão completa
  const connectionString = BASE_CONNECTION_STRING.replace('<db_password>', encodedPassword);

  // Atualizar ou adicionar MONGODB_URI
  const lines = envContent.split('\n');
  let found = false;
  
  const updatedLines = lines.map(line => {
    if (line.startsWith('MONGODB_URI=')) {
      found = true;
      return `MONGODB_URI=${connectionString}`;
    }
    return line;
  });

  if (!found) {
    updatedLines.push(`MONGODB_URI=${connectionString}`);
  }

  // Escrever .env atualizado
  fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');

  console.log('\n✅ Arquivo .env atualizado com sucesso!');
  console.log(`\n📋 String de conexão configurada:`);
  console.log(`MONGODB_URI=${connectionString}\n`);

  return connectionString;
}

// Executar se chamado diretamente
if (process.argv[2]) {
  const password = process.argv[2];
  updateEnvFile(password);
  console.log('✅ Configuração concluída! Agora execute: npm run dev');
} else {
  console.log('\n📋 Script de Configuração MongoDB Atlas\n');
  console.log('Uso: node config-atlas.js <senha>');
  console.log('\nExemplo:');
  console.log('  node config-atlas.js MinhaSenh@123\n');
}

