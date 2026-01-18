import mongoose from 'mongoose';

/**
 * Schema do Order (Pedido)
 * 
 * Representa um pedido/pagamento no sistema.
 * Armazena informações do pedido, pagamento PIX e status.
 */
const orderSchema = new mongoose.Schema({
  // Usuário que criou o pedido (opcional, pode ser null para checkout público)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Valor total do pedido em reais (ex: 99.90)
  amount: {
    type: Number,
    required: [true, 'Valor do pedido é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero']
  },

  // Descrição do pedido (ex: "Compra de produto X")
  description: {
    type: String,
    default: 'Pagamento via PIX'
  },

  // Email do pagador (obrigatório para Mercado Pago)
  payerEmail: {
    type: String,
    required: [true, 'Email do pagador é obrigatório'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },

  // Itens do pedido (opcional, para detalhamento)
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],

  // Status do pedido
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED'],
    default: 'PENDING'
  },

  // Dados do pagamento PIX
  pix: {
    // QR Code em base64 (para exibir imagem)
    qrCodeBase64: {
      type: String,
      default: null
    },
    // Código PIX copia e cola
    copiaCola: {
      type: String,
      default: null
    },
    // Tempo de expiração em segundos (geralmente 1800 = 30min)
    expiresIn: {
      type: Number,
      default: 1800
    },
    // Data/hora de expiração
    expiresAt: {
      type: Date,
      default: null
    }
  },

  // ID do pagamento no Mercado Pago (para consultas futuras)
  mercadoPagoPaymentId: {
    type: Number,
    default: null
  },

  // Status do pagamento no Mercado Pago
  mercadoPagoStatus: {
    type: String,
    default: null
  },

  // Data em que o pagamento foi confirmado
  paidAt: {
    type: Date,
    default: null
  },

  // Flag para idempotência: indica se o webhook já foi processado
  webhookProcessed: {
    type: Boolean,
    default: false,
    index: true
  },

  // ID do webhook processado (para evitar duplicatas)
  webhookId: {
    type: Number,
    default: null
  }

}, {
  // Opções do schema
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'orders' // Nome da collection no MongoDB
});

/**
 * Índices para melhor performance em consultas frequentes
 */
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ mercadoPagoPaymentId: 1 });
orderSchema.index({ createdAt: -1 }); // Ordenar por mais recente

/**
 * Método virtual para verificar se o pedido está expirado
 */
orderSchema.virtual('isExpired').get(function() {
  if (!this.pix.expiresAt) return false;
  return new Date() > this.pix.expiresAt && this.status === 'PENDING';
});

/**
 * Método estático para buscar pedidos por status
 */
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

/**
 * Método de instância para marcar como pago
 */
orderSchema.methods.markAsPaid = function() {
  this.status = 'PAID';
  this.paidAt = new Date();
  return this.save();
};

/**
 * Transformar o documento ao converter para JSON
 * Remove campos sensíveis ou desnecessários
 */
orderSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Opcionalmente, remover campos internos do response
  // delete obj.__v; // versão do documento
  
  return obj;
};

// Criar e exportar o modelo
const Order = mongoose.model('Order', orderSchema);

export default Order;

