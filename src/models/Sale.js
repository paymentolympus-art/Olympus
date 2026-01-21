import mongoose from 'mongoose';

/**
 * Schema do Sale (Venda)
 * 
 * Representa uma venda finalizada no sistema.
 * Criado quando um pagamento é confirmado via webhook.
 */
const saleSchema = new mongoose.Schema({
  // ID do pedido associado
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'ID do pedido é obrigatório'],
    index: true // Índice para consultas frequentes
  },

  // ID do usuário que fez a compra (pode ser null para checkout público)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  // Valor da venda em reais
  amount: {
    type: Number,
    required: [true, 'Valor da venda é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero']
  },

  // ID do pagamento no Mercado Pago
  mercadoPagoPaymentId: {
    type: Number,
    required: [true, 'ID do pagamento no Mercado Pago é obrigatório'],
    unique: true, // Evita duplicatas (um pagamento = uma venda)
    index: true
  },

  // Status da venda
  status: {
    type: String,
    enum: ['COMPLETED', 'REFUNDED', 'CANCELLED'],
    default: 'COMPLETED'
  },

  // Data em que o pagamento foi confirmado
  paidAt: {
    type: Date,
    default: Date.now
  }

}, {
  // Opções do schema
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'sales' // Nome da collection no MongoDB
});

/**
 * Índices para melhor performance
 */
saleSchema.index({ orderId: 1 });
saleSchema.index({ userId: 1 });
saleSchema.index({ mercadoPagoPaymentId: 1 });
saleSchema.index({ createdAt: -1 }); // Ordenar por mais recente
saleSchema.index({ status: 1 });

/**
 * Método estático para buscar vendas por usuário
 */
saleSchema.statics.findByUserId = function(userId) {
  return this.find({ userId });
};

/**
 * Método estático para buscar vendas por status
 */
saleSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

/**
 * Transformar o documento ao converter para JSON
 */
saleSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return obj;
};

// Criar e exportar o modelo
const Sale = mongoose.model('Sale', saleSchema);

export default Sale;



