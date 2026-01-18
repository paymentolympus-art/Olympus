import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * @desc    Criar um novo produto
 * @route   POST /api/products
 * @access  Private (requer autenticação)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, type, paymentFormat, price } = req.body;
    const userId = req.user._id; // Do middleware 'authenticate'

    // Validar preço (deve ser número)
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return next(errorHandler(400, 'Preço inválido', 'Preço deve ser um número válido maior ou igual a zero'));
    }

    // Criar produto
    const product = new Product({
      userId,
      name,
      description: description || '',
      type: type || 'DIGITAL',
      paymentFormat: paymentFormat || 'ONE_TIME',
      price: priceNumber,
      status: 'PENDING' // Produtos começam como PENDING
    });

    await product.save();

    console.log(`✅ Produto criado: ${product._id} por usuário ${userId}`);

    // Formatar URL da imagem (se for relativa, construir URL completa)
    const productJson = product.toJSON();
    if (productJson.imageUrl && productJson.imageUrl.startsWith('/uploads/')) {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      productJson.imageUrl = `${backendUrl}${productJson.imageUrl}`;
    }

    res.status(201).json({
      data: productJson
    });

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Listar produtos do usuário logado
 * @route   GET /api/products
 * @access  Private (requer autenticação)
 * 
 * Query params:
 * - search: busca por nome ou descrição
 * - status: filtrar por status (ACTIVE, DISABLED, PENDING, REJECTED)
 * - type: filtrar por tipo (DIGITAL, PHYSICAL)
 * - paymentFormat: filtrar por formato de pagamento (ONE_TIME, RECURRING)
 * - page: número da página (padrão: 1)
 * - limit: itens por página (padrão: 10)
 */
export const getProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search, status, type, paymentFormat, page = 1, limit = 10 } = req.query;

    // Construir filtro
    const filter = { userId };

    // Adicionar filtros opcionais
    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (paymentFormat) {
      filter.paymentFormat = paymentFormat;
    }

    // Busca por texto (nome ou descrição)
    if (search) {
      filter.$text = { $search: search };
    }

    // Paginação
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Buscar produtos
    let query = Product.find(filter).sort({ createdAt: -1 });

    // Se não tem busca de texto, ordenar por createdAt
    if (!search) {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query.skip(skip).limit(limitNumber).lean();
    const total = await Product.countDocuments(filter);

    // Formatar produtos
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const formattedProducts = products.map(product => {
      // Formatar URL da imagem (se for relativa, construir URL completa)
      let imageUrl = product.imageUrl || null;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        imageUrl = `${backendUrl}${imageUrl}`;
      }
      
      const formatted = {
        ...product,
        id: product._id.toString(),
        price: product.price.toString(),
        imageUrl: imageUrl
      };
      delete formatted._id;
      delete formatted.__v;
      return formatted;
    });

    console.log(`📦 Produtos encontrados: ${total} para usuário ${userId}`);

    res.status(200).json({
      data: {
        products: formattedProducts,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Buscar produto por ID
 * @route   GET /api/products/:id
 * @access  Private (requer autenticação)
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar produto
    const product = await Product.findOne({ _id: id, userId }).lean();

    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão para acessá-lo'));
    }

    // Buscar ofertas do produto
    const offers = await Offer.find({ productId: id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    // Formatar ofertas
    const formattedOffers = offers.map(offer => {
      const formatted = {
        ...offer,
        id: offer._id.toString(),
        price: offer.price.toString(),
        priceFake: (offer.priceFake || 0).toString(),
        discount: offer.discount || 0,
        isDefault: offer.isDefault || false
      };
      delete formatted._id;
      delete formatted.__v;
      return formatted;
    });

    // Buscar oferta padrão
    const defaultOfferDoc = offers.find(o => o.isDefault) || offers[0] || null;
    const defaultOffer = defaultOfferDoc ? {
      ...defaultOfferDoc,
      id: defaultOfferDoc._id.toString(),
      price: defaultOfferDoc.price.toString(),
      priceFake: (defaultOfferDoc.priceFake || 0).toString(),
      discount: defaultOfferDoc.discount || 0,
      isDefault: defaultOfferDoc.isDefault || false
    } : null;
    if (defaultOffer) {
      delete defaultOffer._id;
      delete defaultOffer.__v;
    }

    // Formatar URL da imagem (se for relativa, construir URL completa)
    let imageUrl = product.imageUrl || null;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      imageUrl = `${backendUrl}${imageUrl}`;
    }

    // Formatar produto com detalhes adicionais
    const productDetails = {
      ...product,
      id: product._id.toString(),
      price: product.price.toString(),
      image: imageUrl,
      // Campos relacionados
      offers: formattedOffers,
      integrations: [],
      domains: [],
      productShippingOption: [],
      salesCount: 0,
      defaultOffer: defaultOffer
    };

    delete productDetails._id;
    delete productDetails.__v;

    console.log(`🔍 Produto encontrado: ${id}`);

    res.status(200).json({
      data: {
        product: productDetails
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Atualizar produto
 * @route   PUT /api/products/:id
 * @access  Private (requer autenticação)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, type, paymentFormat, price, status, urlBack, urlRedirect } = req.body;

    // Buscar produto
    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão para editá-lo'));
    }

    // Atualizar campos (apenas os fornecidos)
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (type !== undefined) product.type = type;
    if (paymentFormat !== undefined) product.paymentFormat = paymentFormat;
    if (status !== undefined) product.status = status;
    if (urlBack !== undefined) product.urlBack = urlBack || '';
    if (urlRedirect !== undefined) product.urlRedirect = urlRedirect || '';

    // Atualizar preço (se fornecido)
    if (price !== undefined) {
      const priceNumber = parseFloat(price);
      if (isNaN(priceNumber) || priceNumber < 0) {
        return next(errorHandler(400, 'Preço inválido', 'Preço deve ser um número válido maior ou igual a zero'));
      }
      product.price = priceNumber;
    }

    await product.save();

    console.log(`✅ Produto atualizado: ${id}`);

    // Formatar URL da imagem (se for relativa, construir URL completa)
    const productJson = product.toJSON();
    if (productJson.imageUrl && productJson.imageUrl.startsWith('/uploads/')) {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      productJson.imageUrl = `${backendUrl}${productJson.imageUrl}`;
    }

    res.status(200).json({
      data: productJson
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Deletar produto
 * @route   DELETE /api/products/:id
 * @access  Private (requer autenticação)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar e deletar produto
    const product = await Product.findOneAndDelete({ _id: id, userId });

    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão para deletá-lo'));
    }

    console.log(`🗑️ Produto deletado: ${id}`);

    res.status(200).json({
      data: {
        message: 'Produto deletado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Upload de imagem do produto
 * @route   POST /api/products/:id/image
 * @access  Private (requer autenticação)
 * 
 * Aceita FormData com campo 'image' contendo o arquivo
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return next(errorHandler(400, 'Arquivo não fornecido', 'Por favor, envie uma imagem'));
    }

    // Buscar produto
    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      // Remover arquivo se produto não foi encontrado
      if (req.file.path) {
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      }
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão para editá-lo'));
    }

    // Construir URL completa da imagem
    // Em produção, fazer upload para S3/Cloudinary e usar URL deles
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    
    // Se já tinha imagem, remover arquivo antigo
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const oldImagePath = path.join(__dirname, '../../', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.warn('⚠️  Erro ao remover imagem antiga:', err.message);
      }
    }

    // Atualizar URL da imagem
    product.imageUrl = imageUrl;

    await product.save();

    console.log(`✅ Imagem do produto atualizada: ${id}`);

    // Formatar URL da imagem (se for relativa, construir URL completa)
    const productJson = product.toJSON();
    if (productJson.imageUrl && productJson.imageUrl.startsWith('/uploads/')) {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      productJson.imageUrl = `${backendUrl}${productJson.imageUrl}`;
    }

    res.status(200).json({
      data: productJson
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
 * @desc    Remover imagem do produto
 * @route   DELETE /api/products/:id/image
 * @access  Private (requer autenticação)
 */
export const removeProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar produto
    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão para editá-lo'));
    }

    // Remover URL da imagem
    product.imageUrl = null;

    await product.save();

    console.log(`🗑️ Imagem do produto removida: ${id}`);

    // Formatar URL da imagem (se for relativa, construir URL completa)
    const productJson = product.toJSON();
    if (productJson.imageUrl && productJson.imageUrl.startsWith('/uploads/')) {
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      productJson.imageUrl = `${backendUrl}${productJson.imageUrl}`;
    }

    res.status(200).json({
      data: productJson
    });

  } catch (error) {
    console.error('❌ Erro ao remover imagem:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

