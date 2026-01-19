import mongoose from 'mongoose';

/**
 * Schema de Orderbump
 * 
 * Representa uma oferta cruzada (orderbump) associada a um produto principal
 * Um orderbump está associado a uma oferta de outro produto
 */
const orderbumpSchema = new mongoose.Schema({
  // Produto principal (onde o orderbump será exibido)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID do produto principal é obrigatório'],
    index: true
  },
  // Oferta que será usada como orderbump
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: [true, 'ID da oferta é obrigatório'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome do orderbump é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  callToAction: {
    type: String,
    required: [true, 'Chamada para ação é obrigatória'],
    trim: true,
    minlength: [3, 'Chamada para ação deve ter pelo menos 3 caracteres'],
    maxlength: [50, 'Chamada para ação deve ter no máximo 50 caracteres'],
    default: 'Sim, eu aceito essa oferta'
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  // Preço atual do orderbump (pode ser diferente do preço da oferta)
  price: {
    type: Number,
    required: true,
    min: [0, 'Preço deve ser maior ou igual a zero']
  },
  // Preço fake/comparação
  priceFake: {
    type: Number,
    default: 0,
    min: [0, 'Preço fake deve ser maior ou igual a zero']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISABLED'],
    default: 'DISABLED',
    index: true
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'orderbumps'
});

// Índices para melhorar performance
orderbumpSchema.index({ productId: 1, status: 1 });
orderbumpSchema.index({ userId: 1 });
orderbumpSchema.index({ offerId: 1 });
orderbumpSchema.index({ createdAt: -1 });

/**
 * Método para transformar o documento em JSON
 */
orderbumpSchema.methods.toJSON = function() {
  const orderbump = this.toObject();
  
  orderbump.id = orderbump._id.toString();
  delete orderbump._id;
  delete orderbump.__v;
  
  // Converter preços para string (formato esperado pelo frontend)
  orderbump.price = orderbump.price.toString();
  orderbump.priceFake = (orderbump.priceFake || 0).toString();
  
  // Se tiver imagem, formatar URL completa
  if (orderbump.imageUrl && orderbump.imageUrl.startsWith('/uploads/')) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    orderbump.image = `${backendUrl}${orderbump.imageUrl}`;
    orderbump.imageUrl = `${backendUrl}${orderbump.imageUrl}`;
  } else if (orderbump.imageUrl) {
    orderbump.image = orderbump.imageUrl;
  } else {
    orderbump.image = null;
  }
  
  return orderbump;
};

const Orderbump = mongoose.model('Orderbump', orderbumpSchema);

export default Orderbump;


