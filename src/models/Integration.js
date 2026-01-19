import mongoose from 'mongoose';

/**
 * Schema de Integração
 * 
 * Representa uma integração (UTMIFY, WEBHOOK, etc.)
 * que pode ser associada a produtos
 */
const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome da integração é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  type: {
    type: String,
    enum: ['UTMIFY', 'WEBHOOK'],
    required: [true, 'Tipo da integração é obrigatório'],
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  // Campos opcionais dependendo do tipo
  key: {
    type: String,
    default: null,
    trim: true
  },
  secret: {
    type: String,
    default: null,
    trim: true
  },
  token: {
    type: String,
    default: null,
    trim: true
  },
  // Dados adicionais (JSON)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'integrations'
});

// Índices para melhorar performance
integrationSchema.index({ userId: 1, type: 1 });
integrationSchema.index({ userId: 1, active: 1 });
integrationSchema.index({ name: 'text' }); // Índice de texto para busca

/**
 * Método para transformar o documento em JSON
 */
integrationSchema.methods.toJSON = function() {
  const integration = this.toObject();
  
  integration.id = integration._id.toString();
  delete integration._id;
  delete integration.__v;
  
  // Não retornar secrets/tokens sensíveis em respostas gerais
  // Apenas quando necessário (será feito nos controllers específicos)
  
  return integration;
};

const Integration = mongoose.model('Integration', integrationSchema);

export default Integration;


