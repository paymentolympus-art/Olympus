import mongoose from 'mongoose';

/**
 * Schema de Oferta
 * 
 * Representa uma oferta de preço para um produto
 */
const offerSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID do produto é obrigatório'],
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
    required: [true, 'Nome da oferta é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior ou igual a zero']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Desconto não pode ser negativo']
  },
  priceFake: {
    type: Number,
    default: 0,
    min: [0, 'Preço fake deve ser maior ou igual a zero']
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  collection: 'offers'
});

// Índices
offerSchema.index({ productId: 1, isDefault: 1 });
offerSchema.index({ userId: 1 });
offerSchema.index({ slug: 1 }, { unique: true });

/**
 * Método para transformar o documento em JSON
 */
offerSchema.methods.toJSON = function() {
  const offer = this.toObject();
  
  offer.id = offer._id.toString();
  delete offer._id;
  delete offer.__v;
  
  // Converter preços para string (formato esperado pelo frontend)
  offer.price = offer.price.toString();
  offer.priceFake = (offer.priceFake || 0).toString();
  
  return offer;
};

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;

