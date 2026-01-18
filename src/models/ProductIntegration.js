import mongoose from 'mongoose';

/**
 * Schema de Produto-Integração (Tabela de Relacionamento)
 * 
 * Representa a associação entre um produto e uma integração
 * Muitos-para-muitos entre Product e Integration
 */
const productIntegrationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID do produto é obrigatório'],
    index: true
  },
  integrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: [true, 'ID da integração é obrigatório'],
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
  collection: 'product_integrations'
});

// Índice único para evitar duplicatas
productIntegrationSchema.index({ productId: 1, integrationId: 1 }, { unique: true });
productIntegrationSchema.index({ userId: 1 });
productIntegrationSchema.index({ integrationId: 1 });

/**
 * Método para transformar o documento em JSON
 */
productIntegrationSchema.methods.toJSON = function() {
  const productIntegration = this.toObject();
  
  productIntegration.id = productIntegration._id.toString();
  delete productIntegration._id;
  delete productIntegration.__v;
  
  return productIntegration;
};

const ProductIntegration = mongoose.model('ProductIntegration', productIntegrationSchema);

export default ProductIntegration;

