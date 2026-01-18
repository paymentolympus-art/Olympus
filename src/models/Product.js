import mongoose from 'mongoose';

/**
 * Schema de Produto
 * 
 * Representa um produto no sistema (digital ou físico)
 * que pode ser vendido através do gateway de pagamento
 */
const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['DIGITAL', 'PHYSICAL'],
    default: 'DIGITAL',
    required: true
  },
  paymentFormat: {
    type: String,
    enum: ['ONE_TIME', 'RECURRING'],
    default: 'ONE_TIME',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior ou igual a zero']
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISABLED', 'PENDING', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  urlBack: {
    type: String,
    default: '',
    trim: true
  },
  urlRedirect: {
    type: String,
    default: '',
    trim: true
  },
  checkout: {
    type: String,
    default: null,
    trim: true
  },
  configCheckout: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'products'
});

// Índices para melhorar performance das buscas
productSchema.index({ userId: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Índice de texto para busca
productSchema.index({ type: 1 });
productSchema.index({ paymentFormat: 1 });
productSchema.index({ createdAt: -1 }); // Ordenação por data de criação

/**
 * Método para transformar o documento em JSON
 * Remove campos sensíveis e formata dados
 */
productSchema.methods.toJSON = function() {
  const product = this.toObject();
  
  // Converter ObjectId para string
  product.id = product._id.toString();
  delete product._id;
  delete product.__v;
  
  // Converter preço para string (formato esperado pelo frontend)
  product.price = product.price.toString();
  
  return product;
};

const Product = mongoose.model('Product', productSchema);

export default Product;

