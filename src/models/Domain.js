import mongoose from 'mongoose';

/**
 * Schema de Domínio
 * 
 * Representa um domínio customizado que pode ser associado a produtos
 * para criar URLs personalizadas de checkout
 */
const domainSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome do domínio é obrigatório'],
    trim: true,
    lowercase: true,
    minlength: [3, 'Nome do domínio deve ter pelo menos 3 caracteres'],
    maxlength: [255, 'Nome do domínio deve ter no máximo 255 caracteres'],
    match: [/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Formato de domínio inválido'],
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'ERROR'],
    default: 'PENDING',
    index: true
  },
  cnameType: {
    type: String,
    default: 'CNAME',
    enum: ['CNAME']
  },
  cnameName: {
    type: String,
    default: 'pay',
    trim: true
  },
  cnameValue: {
    type: String,
    default: 'checkout.olympuspayment.com.br',
    trim: true
  },
  // Dados de verificação DNS
  verificationLastChecked: {
    type: Date,
    default: null
  },
  verificationResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'domains'
});

// Índice único para nome de domínio por usuário
domainSchema.index({ userId: 1, name: 1 }, { unique: true });
domainSchema.index({ userId: 1, status: 1 });
domainSchema.index({ name: 'text' });

/**
 * Método para transformar o documento em JSON
 */
domainSchema.methods.toJSON = function() {
  const domain = this.toObject();
  
  domain.id = domain._id.toString();
  delete domain._id;
  delete domain.__v;
  
  // Formatar CNAME completo
  if (domain.cnameName && domain.name) {
    domain.cnameFull = `${domain.cnameName}.${domain.name}`;
  }
  
  return domain;
};

const Domain = mongoose.model('Domain', domainSchema);

export default Domain;

