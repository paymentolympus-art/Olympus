import mongoose from 'mongoose';

/**
 * Schema de Produto-Domínio (Tabela de Relacionamento)
 * 
 * Representa a associação entre um produto e um domínio
 * Um produto pode ter apenas um domínio (mas um domínio pode ter vários produtos)
 */
const productDomainSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID do produto é obrigatório'],
    index: true
  },
  domainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: [true, 'ID do domínio é obrigatório'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  }
}, {
  timestamps: true,
  collection: 'product_domains'
});

// Índice único para evitar múltiplos domínios por produto
productDomainSchema.index({ productId: 1 }, { unique: true });
productDomainSchema.index({ userId: 1 });
productDomainSchema.index({ domainId: 1 });

/**
 * Método para transformar o documento em JSON
 */
productDomainSchema.methods.toJSON = function() {
  const productDomain = this.toObject();
  
  productDomain.id = productDomain._id.toString();
  delete productDomain._id;
  delete productDomain.__v;
  
  return productDomain;
};

const ProductDomain = mongoose.model('ProductDomain', productDomainSchema);

export default ProductDomain;



