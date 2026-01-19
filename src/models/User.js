import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Schema do User (Usuário)
 * 
 * Representa um usuário no sistema.
 * Suporta dois tipos de conta: PERSON (Pessoa Física) e COMPANY (Pessoa Jurídica).
 */
const userSchema = new mongoose.Schema({
  // Dados básicos (comuns a ambos os tipos)
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },

  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    index: true
  },

  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não retornar senha por padrão
  },

  // Tipo de conta: PERSON (Pessoa Física) ou COMPANY (Pessoa Jurídica)
  accountType: {
    type: String,
    enum: ['PERSON', 'COMPANY'],
    required: [true, 'Tipo de conta é obrigatório']
  },

  // Dados específicos de Pessoa Física
  cpf: {
    type: String,
    default: null,
    sparse: true, // Permite null, mas se fornecido deve ser único
    match: [/^\d{11}$/, 'CPF deve ter 11 dígitos']
  },

  birthDate: {
    type: Date,
    default: null
  },

  // Dados específicos de Pessoa Jurídica
  cnpj: {
    type: String,
    default: null,
    sparse: true, // Permite null, mas se fornecido deve ser único
    match: [/^\d{14}$/, 'CNPJ deve ter 14 dígitos']
  },

  companyName: {
    type: String,
    default: null,
    trim: true
  },

  tradeName: {
    type: String,
    default: null,
    trim: true
  },

  // Dados comuns
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    match: [/^\d{11}$/, 'Telefone deve ter 11 dígitos']
  },

  // Status da conta
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'ACTIVE'
  },

  // Email verificado
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Taxas (para gateway de pagamentos)
  fixTax: {
    type: Number,
    default: 0.50, // Taxa fixa padrão
    min: 0
  },

  percentTax: {
    type: Number,
    default: 3.99, // Taxa percentual padrão
    min: 0,
    max: 100
  },

  // Autenticação de dois fatores (2FA)
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  twoFactorMethod: {
    type: String,
    enum: ['email', 'app', null],
    default: null
  },

  // Aceite de termos
  acceptTerms: {
    type: Boolean,
    required: [true, 'Aceite de termos é obrigatório'],
    default: false
  },

  termsAcceptedAt: {
    type: Date,
    default: Date.now
  }

}, {
  // Opções do schema
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'users' // Nome da collection no MongoDB
});

/**
 * Índices para melhor performance
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ cpf: 1 }, { sparse: true }); // Índice esparso para cpf
userSchema.index({ cnpj: 1 }, { sparse: true }); // Índice esparso para cnpj
userSchema.index({ accountType: 1 });
userSchema.index({ status: 1 });

/**
 * Middleware: Hash da senha antes de salvar
 */
userSchema.pre('save', async function(next) {
  // Apenas hash se a senha foi modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash da senha com 10 rounds de salt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método de instância: Comparar senha
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Método de instância: Remover senha do JSON
 */
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Remover senha do objeto retornado
  delete obj.password;
  
  // Remover __v (versão do documento)
  delete obj.__v;
  
  return obj;
};

/**
 * Método estático: Buscar usuário por email
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Método estático: Buscar usuários por tipo
 */
userSchema.statics.findByAccountType = function(accountType) {
  return this.find({ accountType, status: 'ACTIVE' });
};

// Criar e exportar o modelo
const User = mongoose.model('User', userSchema);

export default User;


