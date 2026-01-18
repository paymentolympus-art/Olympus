import Offer from '../models/Offer.js';
import Product from '../models/Product.js';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * Função auxiliar: Tenta ativar produto automaticamente
 * Verifica se todos os requisitos estão atendidos e ativa o produto
 */
async function tryActivateProduct(productId, userId) {
  try {
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) return false;

    // Se já está ativo, não precisa fazer nada
    if (product.status === 'ACTIVE') return false;

    // Validar requisitos
    const errors = [];

    // Validar nome
    if (!product.name || product.name.length < 3) {
      errors.push('Nome do produto deve ter pelo menos 3 caracteres');
    }

    // Validar preço
    if (!product.price || product.price <= 0) {
      errors.push('Produto precisa ter preço maior que zero');
    }

    // Validar oferta padrão
    const defaultOffer = await Offer.findOne({ productId, userId, isDefault: true });
    if (!defaultOffer) {
      errors.push('Produto precisa ter uma oferta padrão');
    }

    // Se todos requisitos OK, ativar produto
    if (errors.length === 0) {
      product.status = 'ACTIVE';
      await product.save();
      console.log(`✅ Produto ativado automaticamente: ${productId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro ao tentar ativar produto automaticamente:', error);
    return false;
  }
}

/**
 * @desc    Criar uma nova oferta
 * @route   POST /api/offers
 * @access  Private
 */
export const createOffer = async (req, res, next) => {
  try {
    const { productId, name, description, price, discount, priceFake } = req.body;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Gerar slug único
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Offer.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Se for a primeira oferta do produto, tornar default
    const existingOffers = await Offer.countDocuments({ productId });
    const isDefault = existingOffers === 0;

    // Se esta for default, remover default das outras
    if (isDefault) {
      await Offer.updateMany({ productId }, { isDefault: false });
    }

    const offer = new Offer({
      productId,
      userId,
      name,
      description: description || '',
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      priceFake: priceFake ? parseFloat(priceFake) : 0,
      slug,
      isDefault
    });

    await offer.save();

    console.log(`✅ Oferta criada: ${offer._id} para produto ${productId}`);

    // Se for oferta padrão, tentar ativar produto automaticamente
    if (isDefault) {
      await tryActivateProduct(productId, userId);
    }

    res.status(201).json({
      data: {
        offer: offer.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar oferta:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Criar oferta padrão para um produto
 * @route   POST /api/offers/default/:productId
 * @access  Private
 */
export const createDefaultOffer = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Verificar se já existe oferta padrão
    const existingDefault = await Offer.findOne({ productId, isDefault: true });
    if (existingDefault) {
      return res.status(200).json({
        data: {
          offer: existingDefault.toJSON()
        }
      });
    }

    // Criar oferta padrão com preço do produto
    const slug = `default-${productId}`;
    const offer = new Offer({
      productId,
      userId,
      name: 'Oferta Padrão',
      description: 'Oferta padrão do produto',
      price: product.price,
      discount: 0,
      slug,
      isDefault: true
    });

    await offer.save();

    console.log(`✅ Oferta padrão criada: ${offer._id} para produto ${productId}`);

    // Tentar ativar produto automaticamente
    await tryActivateProduct(productId, userId);

    res.status(201).json({
      data: {
        offer: offer.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar oferta padrão:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Listar ofertas de um produto
 * @route   GET /api/offers/product/:productId
 * @access  Private
 */
export const getOffersByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const offers = await Offer.find({ productId })
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Offer.countDocuments({ productId });

    const formattedOffers = offers.map(offer => {
      const formatted = {
        ...offer,
        id: offer._id.toString(),
        price: offer.price.toString(),
        priceFake: (offer.priceFake || 0).toString()
      };
      delete formatted._id;
      delete formatted.__v;
      return formatted;
    });

    res.status(200).json({
      data: {
        offers: formattedOffers,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ofertas:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Buscar oferta por ID
 * @route   GET /api/offers/:id
 * @access  Private
 */
export const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const offer = await Offer.findOne({ _id: id, userId }).lean();

    if (!offer) {
      return next(errorHandler(404, 'Oferta não encontrada', 'Oferta não foi encontrada ou você não tem permissão'));
    }

    const offerDetails = {
      ...offer,
      id: offer._id.toString(),
      price: offer.price.toString(),
      priceFake: (offer.priceFake || 0).toString()
    };
    delete offerDetails._id;
    delete offerDetails.__v;

    res.status(200).json({
      data: {
        offer: offerDetails
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar oferta:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Atualizar oferta
 * @route   PUT /api/offers/:id
 * @access  Private
 */
export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, price, discount, priceFake } = req.body;

    const offer = await Offer.findOne({ _id: id, userId });

    if (!offer) {
      return next(errorHandler(404, 'Oferta não encontrada', 'Oferta não foi encontrada ou você não tem permissão'));
    }

    if (name !== undefined) offer.name = name;
    if (description !== undefined) offer.description = description;
    if (price !== undefined) offer.price = parseFloat(price);
    if (discount !== undefined) offer.discount = parseFloat(discount);
    if (priceFake !== undefined) offer.priceFake = parseFloat(priceFake);

    await offer.save();

    console.log(`✅ Oferta atualizada: ${id}`);

    res.status(200).json({
      data: {
        offer: offer.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar oferta:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Definir oferta como padrão
 * @route   PATCH /api/offers/:id/default
 * @access  Private
 */
export const setDefaultOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const offer = await Offer.findOne({ _id: id, userId });

    if (!offer) {
      return next(errorHandler(404, 'Oferta não encontrada', 'Oferta não foi encontrada ou você não tem permissão'));
    }

    // Remover default de todas as ofertas do produto
    await Offer.updateMany({ productId: offer.productId }, { isDefault: false });

    // Definir esta como default
    offer.isDefault = true;
    await offer.save();

    console.log(`✅ Oferta definida como padrão: ${id}`);

    // Tentar ativar produto automaticamente
    await tryActivateProduct(offer.productId, userId);

    res.status(200).json({
      data: {
        offer: offer.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao definir oferta padrão:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Deletar oferta
 * @route   DELETE /api/offers/:id
 * @access  Private
 */
export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const offer = await Offer.findOneAndDelete({ _id: id, userId });

    if (!offer) {
      return next(errorHandler(404, 'Oferta não encontrada', 'Oferta não foi encontrada ou você não tem permissão'));
    }

    console.log(`🗑️ Oferta deletada: ${id}`);

    res.status(200).json({
      data: {
        message: 'Oferta deletada com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar oferta:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

