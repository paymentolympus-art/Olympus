import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * Configurar Mercado Pago SDK
 * 
 * O access token deve estar configurado no .env
 */
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-seu-token-aqui',
  options: {
    timeout: 5000,
  }
});

const paymentClient = new Payment(client);

/**
 * @desc    Criar um novo pedido e gerar QR Code PIX
 * @route   POST /api/orders
 * @access  Public (checkout público, não requer autenticação)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { userId, amount, description, payerEmail, items } = req.body;

    // ========================================
    // 1. VALIDAR DADOS (já validado pelo middleware, mas verificação extra)
    // ========================================
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'O valor do pedido deve ser maior que zero'
      });
    }

    if (!payerEmail) {
      return res.status(400).json({
        error: 'Email obrigatório',
        message: 'Email do pagador é obrigatório'
      });
    }

    // ========================================
    // 2. CRIAR DOCUMENTO ORDER NO MONGODB
    // ========================================
    
    // Converter userId para ObjectId se fornecido
    const orderUserId = userId ? new mongoose.Types.ObjectId(userId) : null;

    // Criar ordem no banco (ainda sem dados do PIX)
    const order = new Order({
      userId: orderUserId,
      amount,
      description: description || 'Pagamento via PIX',
      payerEmail,
      items: items || [],
      status: 'PENDING'
    });

    // Salvar ordem no banco (para ter um ID)
    await order.save();

    console.log(`📦 Order criado: ${order._id}`);

    // ========================================
    // 3. INTEGRAR COM MERCADO PAGO - CRIAR PAGAMENTO PIX
    // ========================================
    
    // Data de expiração: 30 minutos a partir de agora
    const expiresIn = 30 * 60; // 30 minutos em segundos
    const dateOfExpiration = new Date(Date.now() + expiresIn * 1000);
    
    // Preparar dados do pagamento para Mercado Pago
    const paymentData = {
      transaction_amount: parseFloat(amount.toFixed(2)), // Garantir 2 casas decimais
      description: description || 'Pagamento via PIX',
      payment_method_id: 'pix', // Método de pagamento: PIX
      payer: {
        email: payerEmail
      },
      date_of_expiration: dateOfExpiration.toISOString(),
      // Opcional: incluir itens se fornecidos
      ...(items && items.length > 0 && {
        items: items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: parseFloat(item.price.toFixed(2))
        }))
      })
    };

    console.log('💳 Criando pagamento no Mercado Pago...');

    // Criar pagamento no Mercado Pago
    let paymentResponse;
    try {
      paymentResponse = await paymentClient.create({ body: paymentData });
    } catch (mpError) {
      console.error('❌ Erro ao criar pagamento no Mercado Pago:', mpError);
      
      // Atualizar status da ordem para FAILED
      order.status = 'FAILED';
      await order.save();

      // Retornar erro ao cliente
      return res.status(400).json({
        error: 'Erro ao criar pagamento',
        message: mpError.message || 'Não foi possível criar o pagamento PIX',
        details: mpError.cause || mpError
      });
    }

    // ========================================
    // 4. EXTRAIR DADOS DO PIX DA RESPOSTA DO MERCADO PAGO
    // ========================================
    
    const payment = paymentResponse.body;

    // Verificar se o pagamento foi criado com sucesso
    if (!payment || payment.status !== 'pending' || payment.status_detail !== 'pending_waiting_payment') {
      console.error('⚠️  Pagamento criado com status inesperado:', payment.status);
      order.status = 'FAILED';
      await order.save();

      return res.status(400).json({
        error: 'Erro ao processar pagamento',
        message: 'Pagamento não foi criado corretamente'
      });
    }

    // Extrair dados do PIX
    const pointOfInteraction = payment.point_of_interaction;
    const transactionData = pointOfInteraction?.transaction_data;

    if (!transactionData) {
      console.error('❌ Dados de transação PIX não encontrados');
      order.status = 'FAILED';
      await order.save();

      return res.status(500).json({
        error: 'Erro ao gerar PIX',
        message: 'Dados do QR Code não foram retornados pelo Mercado Pago'
      });
    }

    // QR Code em base64 (para exibir imagem)
    const qrCodeBase64 = transactionData.qr_code_base64;
    // Código PIX copia e cola
    const copiaCola = transactionData.qr_code;

    if (!copiaCola) {
      console.error('❌ Código PIX não encontrado');
      order.status = 'FAILED';
      await order.save();

      return res.status(500).json({
        error: 'Erro ao gerar PIX',
        message: 'Código PIX não foi retornado pelo Mercado Pago'
      });
    }

    console.log(`✅ Pagamento PIX criado no Mercado Pago: ${payment.id}`);

    // ========================================
    // 5. ATUALIZAR ORDER COM DADOS DO PIX
    // ========================================
    
    order.pix = {
      qrCodeBase64: qrCodeBase64 || null,
      copiaCola: copiaCola,
      expiresIn: expiresIn,
      expiresAt: dateOfExpiration
    };

    order.mercadoPagoPaymentId = payment.id;
    order.mercadoPagoStatus = payment.status;

    // Salvar ordem atualizada
    await order.save();

    console.log(`✅ Order atualizado com dados do PIX: ${order._id}`);

    // ========================================
    // 6. RETORNAR RESPOSTA DE SUCESSO
    // ========================================
    
    // Formato de resposta compatível com o frontend
    return res.status(201).json({
      data: {
        orderId: order._id.toString(),
        status: order.status,
        pixQrCode: qrCodeBase64 || null,
        pixCode: copiaCola,
        expiresAt: dateOfExpiration.toISOString(),
        amount: order.amount,
        description: order.description
      }
    });

  } catch (error) {
    console.error('❌ Erro em createOrder:', error);
    next(error); // Passar para o middleware de erro
  }
};

/**
 * @desc    Consultar status de um pedido
 * @route   GET /api/orders/:orderId/status
 * @access  Public (checkout público, usado para polling)
 * 
 * Lógica:
 * 1. Busca Order no MongoDB pelo _id
 * 2. Se não encontrado → 404
 * 3. Se status já for PAID ou EXPIRED → retorna imediatamente (sem consultar MP)
 * 4. Se status for PENDING:
 *    - Consulta status no Mercado Pago usando mpPaymentId
 *    - Mapeia status do MP para status do Order
 *    - Atualiza Order se necessário
 * 5. Retorna status atualizado
 */
export const getOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // ========================================
    // 1. VALIDAR ORDERID (ObjectId válido)
    // ========================================
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'Formato de ID inválido'
      });
    }

    // ========================================
    // 2. BUSCAR ORDER NO MONGODB
    // ========================================
    
    console.log(`🔍 Buscando Order: ${orderId}`);

    const order = await Order.findById(orderId);

    // Se não encontrado → 404
    if (!order) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
        message: `Pedido com ID ${orderId} não foi encontrado`
      });
    }

    console.log(`✅ Order encontrado: ${order._id}, Status atual: ${order.status}`);

    // ========================================
    // 3. OTIMIZAÇÃO: Se status já for PAID ou EXPIRED, retornar imediatamente
    // ========================================
    
    // Não consulta Mercado Pago se o pedido já está finalizado
    // Isso evita chamadas desnecessárias ao MP (otimização para polling frequente)
    if (order.status === 'PAID' || order.status === 'EXPIRED') {
      console.log(`⚡ Status finalizado (${order.status}), retornando sem consultar MP`);

      return res.status(200).json({
        status: order.status,
        orderId: order._id.toString(),
        amount: order.amount,
        updatedAt: order.updatedAt.toISOString(),
        message: order.status === 'PAID' 
          ? 'Pagamento aprovado!' 
          : 'Pagamento expirado'
      });
    }

    // ========================================
    // 4. VERIFICAR SE PEDIDO EXPIROU LOCALMENTE (pela data)
    // ========================================
    
    // Se o QR Code expirou e ainda está PENDING, marcar como EXPIRED
    if (order.status === 'PENDING' && order.pix?.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(order.pix.expiresAt);

      if (now > expiresAt) {
        console.log(`⏰ Order expirado localmente (${orderId})`);
        
        order.status = 'EXPIRED';
        await order.save();

        return res.status(200).json({
          status: 'EXPIRED',
          orderId: order._id.toString(),
          amount: order.amount,
          updatedAt: order.updatedAt.toISOString(),
          message: 'Pagamento expirado'
        });
      }
    }

    // ========================================
    // 5. CONSULTAR STATUS NO MERCADO PAGO (apenas se PENDING)
    // ========================================
    
    // Verificar se tem mpPaymentId (necessário para consultar no MP)
    if (!order.mercadoPagoPaymentId) {
      console.warn(`⚠️  Order ${orderId} não tem mpPaymentId, retornando status local`);
      
      return res.status(200).json({
        status: order.status,
        orderId: order._id.toString(),
        amount: order.amount,
        updatedAt: order.updatedAt.toISOString(),
        message: 'Status local (sem consulta ao Mercado Pago)'
      });
    }

    console.log(`💳 Consultando status no Mercado Pago (Payment ID: ${order.mercadoPagoPaymentId})...`);

    let paymentResponse;
    try {
      // Consultar pagamento no Mercado Pago usando o SDK
      paymentResponse = await paymentClient.get({ id: order.mercadoPagoPaymentId });
    } catch (mpError) {
      console.error('❌ Erro ao consultar Mercado Pago:', mpError);
      
      // Se houver erro ao consultar MP, retornar status local
      // Não falhar completamente para não interromper polling
      return res.status(200).json({
        status: order.status,
        orderId: order._id.toString(),
        amount: order.amount,
        updatedAt: order.updatedAt.toISOString(),
        message: 'Status local (erro ao consultar Mercado Pago)'
      });
    }

    // Extrair status do Mercado Pago
    const payment = paymentResponse.body;
    const mpStatus = payment.status; // 'pending', 'approved', 'rejected', 'cancelled', etc.

    console.log(`📊 Status no Mercado Pago: ${mpStatus}`);

    // ========================================
    // 6. MAPEAR STATUS DO MP PARA STATUS DO ORDER
    // ========================================
    
    let newStatus = order.status; // Manter status atual por padrão
    let message = 'Pagamento pendente';
    let shouldUpdate = false;

    // Mapeamento de status do Mercado Pago para status do Order
    switch (mpStatus) {
      case 'approved':
        // Pagamento aprovado → atualizar para PAID
        newStatus = 'PAID';
        message = 'Pagamento aprovado!';
        shouldUpdate = true;
        console.log(`✅ Pagamento aprovado! Atualizando Order ${orderId} para PAID`);
        break;

      case 'rejected':
      case 'cancelled':
        // Pagamento rejeitado ou cancelado → atualizar para EXPIRED
        newStatus = 'EXPIRED';
        message = 'Pagamento rejeitado ou cancelado';
        shouldUpdate = true;
        console.log(`❌ Pagamento ${mpStatus}. Atualizando Order ${orderId} para EXPIRED`);
        break;

      case 'pending':
        // Ainda pendente → manter PENDING
        // Verificar se expirou pela data
        if (order.pix?.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(order.pix.expiresAt);

          if (now > expiresAt) {
            newStatus = 'EXPIRED';
            message = 'Pagamento expirado';
            shouldUpdate = true;
            console.log(`⏰ Pagamento expirado por data. Atualizando Order ${orderId} para EXPIRED`);
          }
        }
        break;

      case 'refunded':
        // Reembolsado → pode ser EXPIRED ou manter estado específico
        newStatus = 'EXPIRED';
        message = 'Pagamento reembolsado';
        shouldUpdate = true;
        break;

      default:
        // Outros status → manter status atual e atualizar mercadoPagoStatus
        console.log(`⚠️  Status desconhecido do MP: ${mpStatus}`);
        shouldUpdate = true; // Atualizar apenas mercadoPagoStatus
    }

    // ========================================
    // 7. ATUALIZAR ORDER SE NECESSÁRIO
    // ========================================
    
    if (shouldUpdate) {
      // Atualizar status do Order
      order.status = newStatus;
      order.mercadoPagoStatus = mpStatus;

      // Se foi aprovado, salvar data de pagamento
      if (newStatus === 'PAID' && !order.paidAt) {
        order.paidAt = new Date();
      }

      // Salvar atualização
      await order.save();
      console.log(`💾 Order ${orderId} atualizado: ${order.status}`);
    } else {
      // Apenas atualizar mercadoPagoStatus se mudou
      if (order.mercadoPagoStatus !== mpStatus) {
        order.mercadoPagoStatus = mpStatus;
        await order.save();
      }
    }

    // ========================================
    // 8. RETORNAR RESPOSTA
    // ========================================
    
    // Formato de resposta compatível com o frontend (para polling)
    return res.status(200).json({
      status: order.status,
      orderId: order._id.toString(),
      amount: order.amount,
      updatedAt: order.updatedAt.toISOString(),
      message: message
    });

  } catch (error) {
    console.error('❌ Erro em getOrderStatus:', error);
    next(error); // Passar para o middleware de erro
  }
};

