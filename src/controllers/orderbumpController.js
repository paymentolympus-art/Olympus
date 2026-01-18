import Orderbump from '../models/Orderbump.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * @desc    Listar produtos e ofertas disponíveis para criar orderbump
 * @route   GET /api/products/:productId/order-bumps
 * @access  Private
 * 
 * Retorna todos os produtos e ofertas do usuário (exceto o produto atual)
 * que podem ser usados como orderbump
 */
export const getOrderbumpAvailable = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar todos os produtos do usuário (exceto o produto atual)
    // Removido filtro de status para incluir todos os produtos
    const products = await Product.find({ 
      userId, 
      _id: { $ne: productId }
    }).lean();

    console.log(`📦 Produtos encontrados (exceto atual): ${products.length} para userId: ${userId}`);

    // Buscar ofertas de cada produto
    const orderbumpsAvailable = [];
    
    for (const prod of products) {
      const offers = await Offer.find({ productId: prod._id, userId }).lean();
      
      console.log(`📦 Produto "${prod.name}" (${prod._id}): ${offers.length} ofertas encontradas`);
      
      // Só adicionar se o produto tiver ofertas
      // (não faz sentido criar orderbump sem oferta)
      for (const offer of offers) {
        // Formatar URL da imagem do produto (se existir)
        let productImage = prod.imageUrl || null;
        if (productImage) {
          // Se for relativa, transformar em absoluta
          if (productImage.startsWith('/uploads/')) {
            const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
            productImage = `${backendUrl}${productImage}`;
          }
        }

        // Converter preço para número se for string
        let offerPrice = offer.price || 0;
        if (typeof offerPrice === 'string') {
          offerPrice = parseFloat(offerPrice) || 0;
        } else if (typeof offerPrice !== 'number') {
          offerPrice = 0;
        }

        orderbumpsAvailable.push({
          idProduct: prod._id.toString(),
          idOffer: offer._id.toString(),
          title: offer.name || prod.name,
          image: productImage || '',
          price: offerPrice
        });
      }
    }

    console.log(`📦 Orderbumps disponíveis total: ${orderbumpsAvailable.length} para produto ${productId}`);

    res.status(200).json({
      data: {
        message: 'Orderbumps disponíveis encontrados',
        orderBumps: orderbumpsAvailable
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar orderbumps disponíveis:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Criar um novo orderbump
 * @route   POST /api/orderbumps
 * @access  Private
 */
export const createOrderbump = async (req, res, next) => {
  try {
    const { productId, offerId, name, callToAction, description } = req.body;
    const userId = req.user._id;

    // Validar dados obrigatórios
    if (!productId || !offerId || !name || !callToAction || !description) {
      return next(errorHandler(400, 'Dados inválidos', 'Todos os campos são obrigatórios'));
    }

    // Validar que o produto principal existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto principal não foi encontrado ou você não tem permissão'));
    }

    // Validar que a oferta existe e pertence ao usuário
    const offer = await Offer.findOne({ _id: offerId, userId }).populate('productId').lean();
    if (!offer) {
      return next(errorHandler(404, 'Oferta não encontrada', 'Oferta não foi encontrada ou você não tem permissão'));
    }

    // Verificar se já existe orderbump com essa oferta para este produto
    const existingOrderbump = await Orderbump.findOne({
      productId,
      offerId,
      userId
    });

    if (existingOrderbump) {
      return next(errorHandler(400, 'Orderbump já existe', 'Esta oferta já está sendo usada como orderbump para este produto'));
    }

    // Obter preço da oferta
    const offerPrice = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price || 0);
    const offerPriceFake = offer.priceFake ? (typeof offer.priceFake === 'number' ? offer.priceFake : parseFloat(offer.priceFake)) : 0;

    // Criar orderbump
    const orderbump = new Orderbump({
      productId,
      offerId,
      userId,
      name,
      callToAction: callToAction || 'Sim, eu aceito essa oferta',
      description,
      price: offerPrice,
      priceFake: offerPriceFake,
      status: 'DISABLED' // Começa desativado
    });

    await orderbump.save();

    // Popular dados para resposta
    const populated = await Orderbump.findById(orderbump._id)
      .populate('productId', 'name status')
      .populate('offerId', 'name price priceFake')
      .lean();

    const formattedOrderbump = {
      id: populated._id.toString(),
      productId: populated.productId._id.toString(),
      offerId: populated.offerId._id.toString(),
      name: populated.name,
      price: populated.price.toString(),
      priceFake: populated.priceFake.toString(),
      callToAction: populated.callToAction,
      description: populated.description,
      status: populated.status,
      image: populated.imageUrl || null,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt
    };

    console.log(`✅ Orderbump criado: ${orderbump._id} para produto ${productId}`);

    res.status(201).json({
      data: {
        message: 'Orderbump criado com sucesso',
        orderBump: formattedOrderbump
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar orderbump:', error);
    
    // Erro de duplicata
    if (error.code === 11000) {
      return next(errorHandler(400, 'Orderbump já existe', 'Esta oferta já está sendo usada como orderbump para este produto'));
    }
    
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Listar orderbumps de um produto
 * @route   GET /api/orderbumps/product/:productId
 * @access  Private
 */
export const getOrderbumpsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar orderbumps do produto
    const orderbumps = await Orderbump.find({ productId, userId })
      .populate('offerId', 'name price priceFake slug')
      .sort({ createdAt: -1 })
      .lean();

    // Formatar orderbumps
    const formattedOrderbumps = orderbumps.map(ob => {
      const orderbump = {
        ...ob,
        id: ob._id.toString(),
        productId: ob.productId.toString(),
        offerId: ob.offerId._id.toString(),
        name: ob.name,
        price: typeof ob.price === 'number' ? ob.price.toString() : ob.price,
        priceFake: typeof ob.priceFake === 'number' ? ob.priceFake.toString() : (ob.priceFake || 0).toString(),
        callToAction: ob.callToAction,
        description: ob.description,
        status: ob.status,
        createdAt: ob.createdAt,
        updatedAt: ob.updatedAt
      };

      // Formatar URL da imagem
      if (ob.imageUrl && ob.imageUrl.startsWith('/uploads/')) {
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        orderbump.image = `${backendUrl}${ob.imageUrl}`;
        orderbump.imageUrl = `${backendUrl}${ob.imageUrl}`;
      } else if (ob.imageUrl) {
        orderbump.image = ob.imageUrl;
      } else {
        orderbump.image = null;
      }

      delete orderbump._id;
      delete orderbump.__v;
      
      return orderbump;
    });

    console.log(`📦 Orderbumps encontrados: ${formattedOrderbumps.length} para produto ${productId}`);

    res.status(200).json({
      data: {
        orderBumps: formattedOrderbumps
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar orderbumps:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Atualizar orderbump
 * @route   PUT /api/orderbumps/:orderbumpId
 * @access  Private
 */
export const updateOrderbump = async (req, res, next) => {
  try {
    const { orderbumpId } = req.params;
    const userId = req.user._id;
    const { name, callToAction, description, price, priceFake, status } = req.body;

    // Buscar orderbump
    const orderbump = await Orderbump.findOne({ _id: orderbumpId, userId });

    if (!orderbump) {
      return next(errorHandler(404, 'Orderbump não encontrado', 'Orderbump não foi encontrado ou você não tem permissão'));
    }

    // Atualizar campos (apenas os fornecidos)
    if (name !== undefined) orderbump.name = name;
    if (callToAction !== undefined) orderbump.callToAction = callToAction;
    if (description !== undefined) orderbump.description = description;
    if (status !== undefined) {
      if (['ACTIVE', 'DISABLED'].includes(status)) {
        orderbump.status = status;
      } else {
        return next(errorHandler(400, 'Status inválido', 'Status deve ser ACTIVE ou DISABLED'));
      }
    }

    // Atualizar preços (se fornecidos)
    if (price !== undefined) {
      const priceNumber = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(priceNumber) || priceNumber < 0) {
        return next(errorHandler(400, 'Preço inválido', 'Preço deve ser um número válido maior ou igual a zero'));
      }
      orderbump.price = priceNumber;
    }

    if (priceFake !== undefined) {
      const priceFakeNumber = typeof priceFake === 'number' ? priceFake : parseFloat(priceFake);
      if (isNaN(priceFakeNumber) || priceFakeNumber < 0) {
        return next(errorHandler(400, 'Preço fake inválido', 'Preço fake deve ser um número válido maior ou igual a zero'));
      }
      orderbump.priceFake = priceFakeNumber;
    }

    await orderbump.save();

    console.log(`✅ Orderbump atualizado: ${orderbumpId}`);

    // Formatar resposta
    const formattedOrderbump = orderbump.toJSON();

    res.status(200).json({
      data: formattedOrderbump
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar orderbump:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Deletar orderbump
 * @route   DELETE /api/orderbumps/:orderbumpId
 * @access  Private
 */
export const deleteOrderbump = async (req, res, next) => {
  try {
    const { orderbumpId } = req.params;
    const userId = req.user._id;

    // Buscar e deletar orderbump
    const orderbump = await Orderbump.findOneAndDelete({ _id: orderbumpId, userId });

    if (!orderbump) {
      return next(errorHandler(404, 'Orderbump não encontrado', 'Orderbump não foi encontrado ou você não tem permissão'));
    }

    // Se tinha imagem, remover arquivo
    if (orderbump.imageUrl && orderbump.imageUrl.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const imagePath = path.join(__dirname, '../../', orderbump.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.warn('⚠️  Erro ao remover imagem do orderbump:', err.message);
      }
    }

    console.log(`🗑️ Orderbump deletado: ${orderbumpId}`);

    res.status(200).json({
      data: {
        message: 'Orderbump deletado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar orderbump:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Upload de imagem do orderbump
 * @route   POST /api/orderbumps/:orderbumpId/image
 * @access  Private
 */
export const uploadOrderbumpImage = async (req, res, next) => {
  try {
    const { orderbumpId } = req.params;
    const userId = req.user._id;

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return next(errorHandler(400, 'Arquivo não fornecido', 'Por favor, envie uma imagem'));
    }

    // Buscar orderbump
    const orderbump = await Orderbump.findOne({ _id: orderbumpId, userId });

    if (!orderbump) {
      // Remover arquivo se orderbump não foi encontrado
      if (req.file.path) {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      }
      return next(errorHandler(404, 'Orderbump não encontrado', 'Orderbump não foi encontrado ou você não tem permissão'));
    }

    // Construir URL da imagem
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Se já tinha imagem, remover arquivo antigo
    if (orderbump.imageUrl && orderbump.imageUrl.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const oldImagePath = path.join(__dirname, '../../', orderbump.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.warn('⚠️  Erro ao remover imagem antiga:', err.message);
      }
    }

    // Atualizar URL da imagem
    orderbump.imageUrl = imageUrl;
    await orderbump.save();

    console.log(`✅ Imagem do orderbump atualizada: ${orderbumpId}`);

    // Formatar resposta
    const formattedOrderbump = orderbump.toJSON();

    res.status(200).json({
      data: formattedOrderbump
    });

  } catch (error) {
    // Remover arquivo em caso de erro
    if (req.file && req.file.path) {
      try {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('⚠️  Erro ao remover arquivo após erro:', err.message);
      }
    }
    console.error('❌ Erro ao fazer upload da imagem:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Remover imagem do orderbump
 * @route   DELETE /api/orderbumps/:orderbumpId/image
 * @access  Private
 */
export const removeOrderbumpImage = async (req, res, next) => {
  try {
    const { orderbumpId } = req.params;
    const userId = req.user._id;

    // Buscar orderbump
    const orderbump = await Orderbump.findOne({ _id: orderbumpId, userId });

    if (!orderbump) {
      return next(errorHandler(404, 'Orderbump não encontrado', 'Orderbump não foi encontrado ou você não tem permissão'));
    }

    // Remover arquivo se existir
    if (orderbump.imageUrl && orderbump.imageUrl.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const imagePath = path.join(__dirname, '../../', orderbump.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.warn('⚠️  Erro ao remover imagem:', err.message);
      }
    }

    // Remover URL da imagem
    orderbump.imageUrl = null;
    await orderbump.save();

    console.log(`🗑️ Imagem do orderbump removida: ${orderbumpId}`);

    // Formatar resposta
    const formattedOrderbump = orderbump.toJSON();

    res.status(200).json({
      data: formattedOrderbump
    });

  } catch (error) {
    console.error('❌ Erro ao remover imagem:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

