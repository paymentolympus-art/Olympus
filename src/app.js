import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rotas
import orderRoutes from './routes/orderRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import orderbumpRoutes from './routes/orderbumpRoutes.js';
import domainRoutes from './routes/domainRoutes.js';

// Importar middleware de tratamento de erros
import { errorHandler } from './middlewares/errorHandler.js';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app = express();

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// CORS - Permitir requisições do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080', // Frontend na porta 8080
  credentials: true
}));

// IMPORTANTE: Webhooks precisam de raw body para validação de assinatura
// Mas Express precisa de JSON para outras rotas
// Solução: usar express.json() geralmente, mas criar rota específica para webhooks

// Body Parser - Permitir JSON no body das requisições
app.use(express.json());

// Body Parser - Permitir URL encoded
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// IMPORTANTE: Para webhooks, precisamos acessar o raw body para validação HMAC
// Mas o express.json() já parseou. Para produção, considere usar express.raw() 
// apenas na rota de webhooks OU configurar antes do express.json()
// Por enquanto, usaremos o body parseado (funciona, mas validação HMAC pode precisar ajuste)

// ========================================
// CONEXÃO COM MONGODB
// ========================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insane-pay';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    console.log(`   Database: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    process.exit(1); // Encerra o processo se não conseguir conectar
  });

// Event listeners para MongoDB
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erro no MongoDB:', error);
});

// ========================================
// ROTAS
// ========================================

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Insane Pay API',
    description: 'Gateway de pagamentos PIX',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      orders: '/api/orders',
      products: '/api/products',
      offers: '/api/offers',
      orderbumps: '/api/orderbumps',
      domains: '/api/domains',
      integrations: '/api/integrations',
      auth: '/auth/session',
      webhooks: '/webhooks/pix/payment'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rota de API info
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Insane Pay API',
    version: '1.0.0',
    description: 'Gateway de pagamentos PIX',
    endpoints: {
      orders: '/api/orders',
      products: '/api/products',
      offers: '/api/offers',
      orderbumps: '/api/orderbumps',
      domains: '/api/domains',
      integrations: '/api/integrations',
      auth: '/auth/session',
      webhooks: '/webhooks/pix/payment'
    }
  });
});

// Rotas de Autenticação (antes das rotas protegidas)
app.use('/auth', authRoutes);
app.use('/user', authRoutes); // /user/create e /user/me

// Rotas da API
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); // Rotas de produtos (inclui /api/products/:productId/order-bumps)
app.use('/api/offers', offerRoutes); // Rotas de ofertas
app.use('/api/integrations', integrationRoutes); // Rotas de integrações (relacionadas a produtos)
app.use('/api/orderbumps', orderbumpRoutes); // Rotas de orderbumps
app.use('/api/domains', domainRoutes); // Rotas de domínios

// Rotas de Webhooks (antes do 404)
app.use('/webhooks', webhookRoutes);

// Rota 404 - Não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================

// Deve ser o último middleware
app.use(errorHandler);

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

// Iniciar servidor apenas se não estiver rodando como serverless function
// Na Vercel, não devemos chamar app.listen() pois ela gerencia o servidor
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log('\n🚀 Servidor iniciado com sucesso!');
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health Check: http://localhost:${PORT}/health\n`);
  });

  // Graceful shutdown - Encerrar conexão MongoDB ao fechar o servidor
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB desconectado. Servidor encerrado.');
    process.exit(0);
  });
}

// Exportar app para uso como serverless function na Vercel
export default app;

