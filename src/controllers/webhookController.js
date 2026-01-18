import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Sale from '../models/Sale.js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configurar Mercado Pago SDK
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-seu-token-aqui',
  options: {
    timeout: 5000,
  }
});

const paymentClient = new Payment(client);

// Configuração do Mercado Pago já feita acima

/**
 * @desc    Receber webhook do Mercado Pago (notificação de pagamento)
 * @route   POST /webhooks/pix/payment
 * @access  Public (chamado pelo Mercado Pago)
 * 
 * IMPORTANTE:
 * - Sempre retornar 200 OK rapidamente (<5s)
 * - MP reenvia se não receber resposta em tempo hábil
 * - Validar assinatura para segurança
 * - Processar de forma idempotente
 */
export const handlePixWebhook = async (req, res) => {
  // IMPORTANTE: Responder 200 OK imediatamente para evitar reenvios
  // Processamento assíncrono será feito após a resposta
  res.status(200).json({ received: true });

  try {
    const body = req.body;
    const headers = req.headers;

    console.log('📨 Webhook recebido do Mercado Pago');
    console.log('   Type:', body.type);
    console.log('   Action:', body.action);
    console.log('   ID:', body.id);

    // ========================================
    // 1. VALIDAR ASSINATURA DO WEBHOOK (SEGURANÇA CRÍTICA!)
    // ========================================
    
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('⚠️  MP_WEBHOOK_SECRET não configurado no .env');
      // Em produção, considere retornar erro ou logar alerta
      // Por enquanto, continua o processamento (para desenvolvimento)
    } else {
      // Validar assinatura apenas se o secret estiver configurado
      const isValid = validateWebhookSignature(headers, body, webhookSecret);

      if (!isValid) {
        console.error('❌ Assinatura do webhook inválida! Possível tentativa de fraude.');
        return; // Não processa se assinatura inválida
      }

      console.log('✅ Assinatura do webhook válida');
    }

    // ========================================
    // 2. VERIFICAR TIPO E ACTION DO WEBHOOK
    // ========================================
    
    // Processar apenas webhooks de pagamento atualizado
    if (body.type !== 'payment') {
      console.log(`⏭️  Webhook tipo '${body.type}' ignorado (apenas processamos 'payment')`);
      return;
    }

    if (body.action !== 'payment.updated') {
      console.log(`⏭️  Webhook action '${body.action}' ignorado (apenas processamos 'payment.updated')`);
      return;
    }

    // ========================================
    // 3. EXTRAIR ID DO PAGAMENTO
    // ========================================
    
    const mpPaymentId = body.data?.id;

    if (!mpPaymentId) {
      console.error('❌ ID do pagamento não encontrado no webhook');
      return;
    }

    console.log(`💳 Processando pagamento ID: ${mpPaymentId}`);

    // ========================================
    // 4. BUSCAR ORDER PELO mpPaymentId
    // ========================================
    
    const order = await Order.findOne({ mercadoPagoPaymentId: mpPaymentId });

    if (!order) {
      console.log(`⚠️  Order não encontrado para paymentId: ${mpPaymentId}`);
      // Retorna silenciosamente (idempotência - MP pode reenviar)
      return;
    }

    console.log(`📦 Order encontrado: ${order._id}, Status atual: ${order.status}`);

    // ========================================
    // 5. IDEMPOTÊNCIA: Verificar se já foi processado
    // ========================================
    
    // Verificar se este webhook específico já foi processado
    if (order.webhookProcessed && order.webhookId === body.id) {
      console.log(`⏭️  Webhook ${body.id} já foi processado anteriormente (idempotência)`);
      return;
    }

    // Se o pedido já está pago, não processa novamente
    if (order.status === 'PAID') {
      console.log(`✅ Order ${order._id} já está pago, ignorando webhook`);
      
      // Marcar como processado mesmo assim
      order.webhookProcessed = true;
      order.webhookId = body.id;
      await order.save();
      
      return;
    }

    // ========================================
    // 6. CONSULTAR STATUS ATUAL NO MERCADO PAGO
    // ========================================
    
    console.log(`🔍 Consultando status no Mercado Pago para paymentId: ${mpPaymentId}`);

    let paymentResponse;
    try {
      paymentResponse = await paymentClient.get({ id: parseInt(mpPaymentId) });
    } catch (mpError) {
      console.error('❌ Erro ao consultar pagamento no Mercado Pago:', mpError);
      // Não falha completamente, apenas loga erro
      return;
    }

    const payment = paymentResponse.body;
    const mpStatus = payment.status;

    console.log(`📊 Status no Mercado Pago: ${mpStatus}`);

    // ========================================
    // 7. PROCESSAR CONFORME STATUS
    // ========================================
    
    if (mpStatus === 'approved') {
      // ========================================
      // PAGAMENTO APROVADO → CRIAR VENDA
      // ========================================
      
      console.log(`✅ Pagamento aprovado! Processando Order ${order._id}...`);

      // Atualizar Order para PAID
      order.status = 'PAID';
      order.mercadoPagoStatus = mpStatus;
      order.paidAt = new Date();
      order.webhookProcessed = true;
      order.webhookId = body.id;
      order.updatedAt = new Date();

      await order.save();

      console.log(`💾 Order ${order._id} atualizado para PAID`);

      // Verificar se já existe uma Sale para este pagamento (idempotência)
      const existingSale = await Sale.findOne({ mercadoPagoPaymentId: parseInt(mpPaymentId) });

      if (existingSale) {
        console.log(`⏭️  Sale já existe para paymentId: ${mpPaymentId} (idempotência)`);
      } else {
        // Criar nova Sale (venda finalizada)
        const sale = new Sale({
          orderId: order._id,
          userId: order.userId,
          amount: order.amount,
          mercadoPagoPaymentId: parseInt(mpPaymentId),
          status: 'COMPLETED',
          paidAt: new Date()
        });

        await sale.save();

        console.log(`💰 Sale criada: ${sale._id} para Order ${order._id}`);
      }

      // ========================================
      // DISPARAR INTEGRAÇÕES (futuro: queue, nodemailer, etc.)
      // ========================================
      
      console.log('🚀 Disparando integrações...');
      
      // Por enquanto, apenas logs
      // Futuro: enviar email, atualizar estoque, disparar webhooks de integração, etc.
      console.log(`   📧 Email de confirmação (futuro: nodemailer)`);
      console.log(`   📦 Atualização de estoque (futuro: integração)`);
      console.log(`   🔗 Webhooks de integração (futuro: UTMify, etc.)`);
      
      // Exemplo de como seria:
      // await sendConfirmationEmail(order.payerEmail, order);
      // await updateInventory(order);
      // await triggerIntegrationWebhooks(order);

    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      // ========================================
      // PAGAMENTO REJEITADO/CANCELADO → EXPIRAR
      // ========================================
      
      console.log(`❌ Pagamento ${mpStatus} para Order ${order._id}`);

      order.status = 'EXPIRED';
      order.mercadoPagoStatus = mpStatus;
      order.webhookProcessed = true;
      order.webhookId = body.id;
      order.updatedAt = new Date();

      await order.save();

      console.log(`💾 Order ${order._id} atualizado para EXPIRED`);

    } else {
      // ========================================
      // OUTROS STATUS (pending, refunded, etc.)
      // ========================================
      
      console.log(`⚠️  Status '${mpStatus}' não altera Order ${order._id} (mantendo ${order.status})`);
      
      // Atualizar apenas mercadoPagoStatus para manter sincronizado
      order.mercadoPagoStatus = mpStatus;
      order.webhookProcessed = true;
      order.webhookId = body.id;
      await order.save();
    }

    console.log(`✅ Webhook processado com sucesso: ${body.id}`);

  } catch (error) {
    // IMPORTANTE: Sempre capturar erros e logar, mas nunca retornar 500
    // MP reenvia se receber erro, causando loop
    console.error('❌ Erro ao processar webhook:', error);
    console.error('   Stack:', error.stack);
    
    // Em produção, considere enviar para serviço de monitoramento (Sentry, etc.)
    // Sentry.captureException(error);
  }
};

/**
 * Valida a assinatura do webhook do Mercado Pago usando HMAC-SHA256
 * 
 * @param {Object} headers - Headers da requisição
 * @param {Object} body - Body da requisição
 * @param {string} webhookSecret - Secret key do webhook (do dashboard MP)
 * @returns {boolean} - true se assinatura válida, false caso contrário
 */
function validateWebhookSignature(headers, body, webhookSecret) {
  try {
    // Extrair assinatura do header x-signature
    const signature = headers['x-signature'] || headers['x-signature'];

    if (!signature) {
      console.error('❌ Header x-signature não encontrado');
      return false;
    }

    // Formato do signature: ts=123456789,v1=hash
    const parts = signature.split(',');
    let ts = null;
    let v1 = null;

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') {
        ts = value.trim();
      } else if (key.trim() === 'v1') {
        v1 = value.trim();
      }
    });

    if (!ts || !v1) {
      console.error('❌ Formato de assinatura inválido');
      return false;
    }

    // Extrair request-id do header
    const requestId = headers['x-request-id'] || headers['x-request-id'];

    if (!requestId) {
      console.error('❌ Header x-request-id não encontrado');
      return false;
    }

    // Extrair ID do body
    const dataId = body.id || body.data?.id;

    if (!dataId) {
      console.error('❌ ID não encontrado no body');
      return false;
    }

    // Criar manifest string (formato: id:xxx;request-id:xxx;ts:xxx;)
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    // Calcular HMAC-SHA256
    const calculated = crypto
      .createHmac('sha256', webhookSecret)
      .update(manifest)
      .digest('hex');

    // Comparar com o v1 recebido
    const isValid = calculated === v1;

    if (!isValid) {
      console.error('❌ Assinatura inválida:');
      console.error(`   Calculado: ${calculated}`);
      console.error(`   Recebido:  ${v1}`);
    }

    return isValid;

  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    return false;
  }
}

