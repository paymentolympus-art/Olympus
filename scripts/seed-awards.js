/**
 * Script para popular os awards iniciais no banco de dados
 * Execute: node scripts/seed-awards.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Award from '../src/models/Award.js';

// Carregar variáveis de ambiente
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/olympus-pay';

// Awards padrão baseados nos valores do frontend
const defaultAwards = [
  {
    title: 'OlympusPay Bronze',
    icon: '/plates/10k.png',
    description: 'Parabéns por conquistar 10K',
    image: '/plates/10k.png',
    minValue: 10000, // R$ 10.000
    typeValue: 'REAL',
    order: 1,
    active: true
  },
  {
    title: 'OlympusPay Silver',
    icon: '/plates/50k.png',
    description: 'Parabéns por conquistar 50K',
    image: '/plates/50k.png',
    minValue: 50000, // R$ 50.000
    typeValue: 'REAL',
    order: 2,
    active: true
  },
  {
    title: 'OlympusPay Gold',
    icon: '/plates/100k.png',
    description: 'Parabéns por conquistar 100K',
    image: '/plates/100k.png',
    minValue: 100000, // R$ 100.000
    typeValue: 'REAL',
    order: 3,
    active: true
  },
  {
    title: 'OlympusPay Legendary',
    icon: '/plates/300k.png',
    description: 'Parabéns por conquistar 300K',
    image: '/plates/300k.png',
    minValue: 300000, // R$ 300.000
    typeValue: 'REAL',
    order: 4,
    active: true
  },
  {
    title: 'OlympusPay Master',
    icon: '/plates/500k.png',
    description: 'Parabéns por conquistar 500K',
    image: '/plates/500k.png',
    minValue: 500000, // R$ 500.000
    typeValue: 'REAL',
    order: 5,
    active: true
  },
  {
    title: 'OlympusPay Olympus',
    icon: '/plates/1m.png',
    description: 'Parabéns por conquistar 1 MILHÃO',
    image: '/plates/1m.png',
    minValue: 1000000, // R$ 1.000.000
    typeValue: 'REAL',
    order: 6,
    active: true
  }
];

async function seedAwards() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Limpar awards existentes (opcional - comente se quiser manter os existentes)
    await Award.deleteMany({});
    console.log('🗑️  Awards antigos removidos');

    // Inserir awards padrão
    const insertedAwards = await Award.insertMany(defaultAwards);
    console.log(`✅ ${insertedAwards.length} awards inseridos com sucesso!`);

    // Listar awards inseridos
    console.log('\n📋 Awards criados:');
    insertedAwards.forEach((award, index) => {
      console.log(`${index + 1}. ${award.title} - R$ ${award.minValue.toLocaleString('pt-BR')}`);
    });

    // Fechar conexão
    await mongoose.connection.close();
    console.log('\n✅ Seed concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAwards();
}

export default seedAwards;

