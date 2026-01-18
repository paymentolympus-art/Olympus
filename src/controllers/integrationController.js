import Integration from '../models/Integration.js';
import ProductIntegration from '../models/ProductIntegration.js';
import Product from '../models/Product.js';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * @desc    Listar integrações de um produto
 * @route   GET /api/integrations/products/:productId
 * @access  Private
 */
export const getIntegrationsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar associações produto-integração
    const productIntegrations = await ProductIntegration.find({ productId, userId })
      .populate('integrationId')
      .sort({ createdAt: -1 })
      .lean();

    // Formatar integrações
    const integrations = productIntegrations
      .filter(pi => pi.integrationId) // Filtrar integrações que foram deletadas
      .map(pi => {
        const integration = pi.integrationId;
        return {
          id: integration._id.toString(),
          name: integration.name,
          type: integration.type,
          active: integration.active || false,
          key: integration.key || null,
          secret: integration.secret || null,
          token: integration.token || null,
          data: integration.data || null,
          createdAt: integration.createdAt || pi.createdAt,
          updatedAt: integration.updatedAt || pi.updatedAt,
          productIntegration: [{
            id: pi._id.toString(),
            createdAt: pi.createdAt,
            product: {
              id: product._id.toString(),
              name: product.name,
              slug: product.name.toLowerCase().replace(/\s+/g, '-'),
              status: product.status
            },
            integration: {
              id: integration._id.toString(),
              name: integration.name,
              type: integration.type
            }
          }]
        };
      });

    console.log(`🔗 Integrações encontradas: ${integrations.length} para produto ${productId}`);

    res.status(200).json({
      data: {
        integrations,
        product: {
          id: product._id.toString(),
          name: product.name,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar integrações do produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Listar integrações não associadas ao produto
 * @route   GET /api/integrations/unassociated/:productId
 * @access  Private
 */
export const getUnassociatedIntegrations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar todas as integrações do usuário
    const allIntegrations = await Integration.find({ userId, active: true }).lean();

    // Buscar integrações já associadas ao produto
    const associatedIntegrations = await ProductIntegration.find({ productId, userId })
      .select('integrationId')
      .lean();

    const associatedIds = associatedIntegrations.map(pi => pi.integrationId.toString());

    // Filtrar integrações não associadas
    const unassociatedIntegrations = allIntegrations
      .filter(integration => !associatedIds.includes(integration._id.toString()))
      .map(integration => ({
        id: integration._id.toString(),
        name: integration.name,
        type: integration.type,
        active: integration.active || false,
        key: integration.key || null,
        secret: integration.secret || null,
        token: integration.token || null,
        data: integration.data || null,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        productIntegration: []
      }));

    console.log(`🔗 Integrações não associadas: ${unassociatedIntegrations.length} para produto ${productId}`);

    res.status(200).json({
      data: {
        unassociatedIntegrations
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar integrações não associadas:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Associar integração a produto
 * @route   POST /api/integrations/associate
 * @access  Private
 */
export const associateIntegrationToProduct = async (req, res, next) => {
  try {
    const { integrationId, productId } = req.body;
    const userId = req.user._id;

    // Validar dados obrigatórios
    if (!integrationId || !productId) {
      return next(errorHandler(400, 'Dados inválidos', 'integrationId e productId são obrigatórios'));
    }

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Validar que a integração existe e pertence ao usuário
    const integration = await Integration.findOne({ _id: integrationId, userId });
    if (!integration) {
      return next(errorHandler(404, 'Integração não encontrada', 'Integração não foi encontrada ou você não tem permissão'));
    }

    // Verificar se já existe associação
    const existingAssociation = await ProductIntegration.findOne({
      productId,
      integrationId,
      userId
    });

    if (existingAssociation) {
      return next(errorHandler(400, 'Associação já existe', 'Esta integração já está associada a este produto'));
    }

    // Criar associação
    const productIntegration = new ProductIntegration({
      productId,
      integrationId,
      userId
    });

    await productIntegration.save();

    // Popular dados para resposta
    const populated = await ProductIntegration.findById(productIntegration._id)
      .populate('productId')
      .populate('integrationId')
      .lean();

    const formattedProductIntegration = {
      id: populated._id.toString(),
      createdAt: populated.createdAt,
      product: {
        id: populated.productId._id.toString(),
        name: populated.productId.name,
        slug: populated.productId.name.toLowerCase().replace(/\s+/g, '-'),
        status: populated.productId.status
      },
      integration: {
        id: populated.integrationId._id.toString(),
        name: populated.integrationId.name,
        type: populated.integrationId.type
      }
    };

    console.log(`✅ Integração ${integrationId} associada ao produto ${productId}`);

    res.status(201).json({
      data: {
        message: 'Integração associada com sucesso',
        productIntegration: formattedProductIntegration
      }
    });

  } catch (error) {
    console.error('❌ Erro ao associar integração:', error);
    
    // Erro de duplicata (unique index)
    if (error.code === 11000) {
      return next(errorHandler(400, 'Associação já existe', 'Esta integração já está associada a este produto'));
    }
    
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Remover associação de integração com produto
 * @route   DELETE /api/integrations/:integrationId/product/:productId
 * @access  Private
 */
export const removeIntegrationFromProduct = async (req, res, next) => {
  try {
    const { integrationId, productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Validar que a integração existe e pertence ao usuário
    const integration = await Integration.findOne({ _id: integrationId, userId });
    if (!integration) {
      return next(errorHandler(404, 'Integração não encontrada', 'Integração não foi encontrada ou você não tem permissão'));
    }

    // Buscar e deletar associação
    const productIntegration = await ProductIntegration.findOneAndDelete({
      productId,
      integrationId,
      userId
    });

    if (!productIntegration) {
      return next(errorHandler(404, 'Associação não encontrada', 'Esta integração não está associada a este produto'));
    }

    console.log(`🗑️ Associação removida: integração ${integrationId} do produto ${productId}`);

    res.status(200).json({
      data: {
        message: 'Associação removida com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao remover associação:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

