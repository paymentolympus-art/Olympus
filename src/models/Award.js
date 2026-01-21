import mongoose from 'mongoose';

/**
 * Schema do Award (Prêmio/Conquista)
 * 
 * Representa os níveis de premiação baseados em faturamento.
 */
const awardSchema = new mongoose.Schema({
  // Título do prêmio
  title: {
    type: String,
    required: [true, 'Título do prêmio é obrigatório'],
    trim: true
  },

  // Ícone do prêmio (URL ou path)
  icon: {
    type: String,
    required: [true, 'Ícone do prêmio é obrigatório'],
    trim: true
  },

  // Descrição do prêmio
  description: {
    type: String,
    required: [true, 'Descrição do prêmio é obrigatória'],
    trim: true
  },

  // Imagem do prêmio (URL ou path)
  image: {
    type: String,
    default: null,
    trim: true
  },

  // Valor mínimo de faturamento para desbloquear (em centavos ou reais)
  minValue: {
    type: Number,
    required: [true, 'Valor mínimo é obrigatório'],
    min: [0, 'Valor mínimo deve ser maior ou igual a zero']
  },

  // Tipo de valor (para formatação)
  typeValue: {
    type: String,
    enum: ['REAL', 'PERCENTAGE'],
    default: 'REAL'
  },

  // Ordem de exibição
  order: {
    type: Number,
    required: [true, 'Ordem é obrigatória'],
    unique: true,
    min: [0, 'Ordem deve ser maior ou igual a zero']
  },

  // Se o award está ativo
  active: {
    type: Boolean,
    default: true
  }

}, {
  // Opções do schema
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'awards' // Nome da collection no MongoDB
});

/**
 * Índices para melhor performance
 */
awardSchema.index({ order: 1 });
awardSchema.index({ active: 1 });
awardSchema.index({ minValue: 1 });

/**
 * Método estático para buscar awards ativos ordenados
 */
awardSchema.statics.findActive = function() {
  return this.find({ active: true }).sort({ order: 1 });
};

/**
 * Transformar o documento ao converter para JSON
 */
awardSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.minValue = obj.minValue.toString(); // Frontend espera string
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Criar e exportar o modelo
const Award = mongoose.model('Award', awardSchema);

export default Award;

