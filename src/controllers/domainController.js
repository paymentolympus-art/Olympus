import Domain from '../models/Domain.js';
import ProductDomain from '../models/ProductDomain.js';
import Product from '../models/Product.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

/**
 * @desc    Listar domínios com filtros e paginação
 * @route   GET /api/domains
 * @access  Private
 */
export const getDomains = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search, status, productId, page = 1, limit = 10 } = req.query;

    // Construir query
    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Se productId fornecido, buscar apenas domínios desse produto
    if (productId) {
      const productDomains = await ProductDomain.find({ productId, userId }).select('domainId').lean();
      const domainIds = productDomains.map(pd => pd.domainId);
      query._id = { $in: domainIds };
    }

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Domain.countDocuments(query);

    // Buscar domínios
    const domains = await Domain.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Buscar associações produto-domínio
    const domainIds = domains.map(d => d._id);
    const productDomains = await ProductDomain.find({ domainId: { $in: domainIds }, userId })
      .populate('productId', 'name slug')
      .lean();

    // Formatar domínios
    const formattedDomains = domains.map(domain => {
      const domainProductDomains = productDomains.filter(pd => pd.domainId.toString() === domain._id.toString());
      
      return {
        id: domain._id.toString(),
        name: domain.name,
        status: domain.status,
        cnameType: domain.cnameType || 'CNAME',
        cnameName: domain.cnameName || 'pay',
        cnameValue: domain.cnameValue || 'checkout.olympuspayment.com.br',
        cnames: domain.cnameName && domain.name ? {
          type: domain.cnameType || 'CNAME',
          name: domain.cnameName || 'pay',
          value: domain.cnameValue || 'checkout.olympuspayment.com.br',
          full: `${domain.cnameName || 'pay'}.${domain.name}`
        } : null,
        productDomain: domainProductDomains.map(pd => ({
          id: pd._id.toString(),
          productId: pd.productId._id.toString(),
          domainId: pd.domainId.toString(),
          createdAt: pd.createdAt,
          product: {
            id: pd.productId._id.toString(),
            name: pd.productId.name,
            slug: pd.productId.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          }
        })),
        userId: domain.userId.toString(),
        createdAt: domain.createdAt,
        updatedAt: domain.updatedAt
      };
    });

    console.log(`🌐 Domínios encontrados: ${total} para userId: ${userId}`);

    res.status(200).json({
      data: {
        message: 'Domínios encontrados',
        domains: formattedDomains,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNextPage: skip + parseInt(limit) < total,
          hasPreviousPage: parseInt(page) > 1,
          nextPage: skip + parseInt(limit) < total ? parseInt(page) + 1 : null,
          previousPage: parseInt(page) > 1 ? parseInt(page) - 1 : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar domínios:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Buscar domínio por ID
 * @route   GET /api/domains/:id
 * @access  Private
 */
export const getDomainById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const domain = await Domain.findOne({ _id: id, userId }).lean();

    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Buscar associações produto-domínio
    const productDomains = await ProductDomain.find({ domainId: id, userId })
      .populate('productId', 'name slug')
      .lean();

    const formattedDomain = {
      id: domain._id.toString(),
      name: domain.name,
      status: domain.status,
      cnameType: domain.cnameType || 'CNAME',
      cnameName: domain.cnameName || 'pay',
      cnameValue: domain.cnameValue || 'checkout.insanepay.com.br',
      cnames: domain.cnameName && domain.name ? {
        type: domain.cnameType || 'CNAME',
        name: domain.cnameName || 'pay',
        value: domain.cnameValue || 'checkout.insanepay.com.br',
        full: `${domain.cnameName || 'pay'}.${domain.name}`
      } : null,
      productDomain: productDomains.map(pd => ({
        id: pd._id.toString(),
        productId: pd.productId._id.toString(),
        domainId: pd.domainId.toString(),
        createdAt: pd.createdAt,
        product: {
          id: pd.productId._id.toString(),
          name: pd.productId.name,
          slug: pd.productId.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
      })),
      userId: domain.userId.toString(),
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt
    };

    res.status(200).json({
      data: {
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar domínio:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Criar domínio
 * @route   POST /api/domains
 * @access  Private
 */
export const createDomain = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    // Validar nome do domínio
    if (!name || typeof name !== 'string') {
      return next(errorHandler(400, 'Nome do domínio é obrigatório', 'Nome do domínio deve ser uma string'));
    }

    // Limpar nome do domínio (remover https://, www., etc)
    let cleanName = name.trim().toLowerCase();
    cleanName = cleanName.replace(/^https?:\/\//, '');
    cleanName = cleanName.replace(/^www\./, '');
    cleanName = cleanName.replace(/\/$/, '');

    // Validar formato
    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(cleanName)) {
      return next(errorHandler(400, 'Formato de domínio inválido', 'Nome do domínio deve ser válido (ex: exemplo.com)'));
    }

    // Verificar se domínio já existe
    const existingDomain = await Domain.findOne({ userId, name: cleanName });
    if (existingDomain) {
      return next(errorHandler(400, 'Domínio já existe', 'Este domínio já está cadastrado'));
    }

    // Criar domínio
    const domain = new Domain({
      userId,
      name: cleanName,
      status: 'PENDING',
      cnameType: 'CNAME',
      cnameName: 'pay',
      cnameValue: process.env.DOMAIN_CNAME_VALUE || 'checkout.olympuspayment.com.br'
    });

    await domain.save();

    console.log(`✅ Domínio criado: ${domain._id} - ${cleanName}`);

    const formattedDomain = {
      id: domain._id.toString(),
      name: domain.name,
      status: domain.status,
      cnameType: domain.cnameType,
      cnameName: domain.cnameName,
      cnameValue: domain.cnameValue,
      cnames: {
        type: domain.cnameType,
        name: domain.cnameName,
        value: domain.cnameValue,
        full: `${domain.cnameName}.${domain.name}`
      },
      productDomain: [],
      userId: domain.userId.toString(),
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt
    };

    res.status(201).json({
      data: {
        message: 'Domínio criado com sucesso',
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar domínio:', error);
    
    // Erro de duplicata
    if (error.code === 11000) {
      return next(errorHandler(400, 'Domínio já existe', 'Este domínio já está cadastrado'));
    }
    
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Atualizar domínio
 * @route   PUT /api/domains/:id
 * @access  Private
 */
export const updateDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name } = req.body;

    const domain = await Domain.findOne({ _id: id, userId });

    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Atualizar nome se fornecido
    if (name) {
      let cleanName = name.trim().toLowerCase();
      cleanName = cleanName.replace(/^https?:\/\//, '');
      cleanName = cleanName.replace(/^www\./, '');
      cleanName = cleanName.replace(/\/$/, '');

      // Validar formato
      if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(cleanName)) {
        return next(errorHandler(400, 'Formato de domínio inválido', 'Nome do domínio deve ser válido'));
      }

      // Verificar se outro domínio com esse nome já existe
      const existingDomain = await Domain.findOne({ userId, name: cleanName, _id: { $ne: id } });
      if (existingDomain) {
        return next(errorHandler(400, 'Domínio já existe', 'Este domínio já está cadastrado'));
      }

      domain.name = cleanName;
      domain.status = 'PENDING'; // Resetar status ao mudar nome
    }

    await domain.save();

    console.log(`✅ Domínio atualizado: ${id}`);

    const formattedDomain = domain.toJSON();

    res.status(200).json({
      data: {
        message: 'Domínio atualizado com sucesso',
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar domínio:', error);
    
    if (error.code === 11000) {
      return next(errorHandler(400, 'Domínio já existe', 'Este domínio já está cadastrado'));
    }
    
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Deletar domínio
 * @route   DELETE /api/domains/:id
 * @access  Private
 */
export const deleteDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const domain = await Domain.findOne({ _id: id, userId });

    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Remover associações produto-domínio
    await ProductDomain.deleteMany({ domainId: id, userId });

    // Deletar domínio
    await Domain.findByIdAndDelete(id);

    console.log(`🗑️ Domínio deletado: ${id}`);

    res.status(200).json({
      data: {
        message: 'Domínio deletado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar domínio:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Verificar domínio (consultar DNS)
 * @route   POST /api/domains/:id/verify
 * @access  Private
 */
export const verifyDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const domain = await Domain.findOne({ _id: id, userId });

    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    const subdomain = `${domain.cnameName || 'pay'}.${domain.name}`;
    const expectedValue = domain.cnameValue || process.env.DOMAIN_CNAME_VALUE || 'checkout.olympuspayment.com.br';

    let isConfigured = false;
    let dnsRecords = null;
    let error = null;

    try {
      // Consultar DNS
      const cnameRecords = await resolveCname(subdomain);
      
      dnsRecords = {
        subdomain,
        cname: cnameRecords,
        expected: expectedValue
      };

      // Verificar se CNAME aponta para o valor esperado
      isConfigured = cnameRecords.some(record => 
        record.toLowerCase().endsWith(expectedValue.toLowerCase())
      );

      if (isConfigured) {
        domain.status = 'VERIFIED';
        domain.verificationLastChecked = new Date();
        domain.verificationResult = { success: true, dnsRecords };
      } else {
        domain.status = 'ERROR';
        domain.verificationLastChecked = new Date();
        domain.verificationResult = { success: false, dnsRecords, error: 'CNAME não aponta para o valor esperado' };
      }

    } catch (dnsError) {
      error = dnsError.message;
      domain.status = 'ERROR';
      domain.verificationLastChecked = new Date();
      domain.verificationResult = { success: false, error: dnsError.message };
    }

    await domain.save();

    console.log(`🔍 Domínio verificado: ${subdomain} - Status: ${domain.status}`);

    res.status(200).json({
      data: {
        message: isConfigured ? 'Domínio verificado com sucesso' : 'Domínio não está configurado corretamente',
        dns: dnsRecords,
        isConfigured,
        status: domain.status
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar domínio:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Listar domínios de um produto
 * @route   GET /api/domains/product/:productId
 * @access  Private
 */
export const getDomainsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar associações produto-domínio
    const productDomains = await ProductDomain.find({ productId, userId })
      .populate('domainId')
      .sort({ createdAt: -1 })
      .lean();

    // Formatar domínios
    const domains = productDomains
      .filter(pd => pd.domainId) // Filtrar domínios que foram deletados
      .map(pd => {
        const domain = pd.domainId;
        return {
          id: domain._id.toString(),
          name: domain.name,
          status: domain.status,
          cnameType: domain.cnameType || 'CNAME',
          cnameName: domain.cnameName || 'pay',
          cnameValue: domain.cnameValue || 'checkout.olympuspayment.com.br',
          cnames: domain.cnameName && domain.name ? {
            type: domain.cnameType || 'CNAME',
            name: domain.cnameName || 'pay',
            value: domain.cnameValue || 'checkout.olympuspayment.com.br',
            full: `${domain.cnameName || 'pay'}.${domain.name}`
          } : null,
          createdAt: pd.createdAt
        };
      });

    console.log(`🌐 Domínios encontrados: ${domains.length} para produto ${productId}`);

    res.status(200).json({
      data: {
        domains,
        product: {
          id: product._id.toString(),
          name: product.name,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar domínios do produto:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Associar produtos em massa a um domínio
 * @route   POST /api/domains/:domainId/associate-products
 * @access  Private
 */
export const associateProducts = async (req, res, next) => {
  try {
    const { domainId } = req.params;
    const userId = req.user._id;
    const { productIds } = req.body;

    // Validar dados
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return next(errorHandler(400, 'Dados inválidos', 'productIds deve ser um array com pelo menos um ID'));
    }

    // Validar que o domínio existe e pertence ao usuário
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Validar que todos os produtos existem e pertencem ao usuário
    const products = await Product.find({ _id: { $in: productIds }, userId }).lean();
    if (products.length !== productIds.length) {
      return next(errorHandler(400, 'Produtos inválidos', 'Um ou mais produtos não foram encontrados'));
    }

    // Remover associações existentes para esses produtos (um produto pode ter apenas um domínio)
    await ProductDomain.deleteMany({ productId: { $in: productIds }, userId });

    // Criar novas associações
    const productDomains = productIds.map(productId => ({
      productId,
      domainId,
      userId
    }));

    await ProductDomain.insertMany(productDomains);

    console.log(`✅ ${productIds.length} produtos associados ao domínio ${domainId}`);

    // Buscar domínio atualizado
    const updatedDomain = await Domain.findById(domainId).lean();

    const formattedDomain = {
      id: updatedDomain._id.toString(),
      name: updatedDomain.name,
      status: updatedDomain.status,
      cnameType: updatedDomain.cnameType || 'CNAME',
      cnameName: updatedDomain.cnameName || 'pay',
      cnameValue: updatedDomain.cnameValue || 'checkout.insanepay.com.br'
    };

    res.status(200).json({
      data: {
        message: `${productIds.length} produto(s) associado(s) com sucesso`,
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao associar produtos:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Adicionar produto individual a um domínio
 * @route   POST /api/domains/:domainId/add-product
 * @access  Private
 */
export const addProductToDomain = async (req, res, next) => {
  try {
    const { domainId } = req.params;
    const userId = req.user._id;
    const { productId } = req.body;

    // Validar dados
    if (!productId) {
      return next(errorHandler(400, 'Dados inválidos', 'productId é obrigatório'));
    }

    // Validar que o domínio existe e pertence ao usuário
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Verificar se produto já tem um domínio (remover associação anterior)
    const existingProductDomain = await ProductDomain.findOne({ productId, userId });
    if (existingProductDomain) {
      await ProductDomain.findByIdAndDelete(existingProductDomain._id);
    }

    // Verificar se já existe associação
    const existingAssociation = await ProductDomain.findOne({ productId, domainId, userId });
    if (existingAssociation) {
      return next(errorHandler(400, 'Associação já existe', 'Este produto já está associado a este domínio'));
    }

    // Criar associação
    const productDomain = new ProductDomain({
      productId,
      domainId,
      userId
    });

    await productDomain.save();

    console.log(`✅ Produto ${productId} associado ao domínio ${domainId}`);

    // Buscar domínio atualizado
    const updatedDomain = await Domain.findById(domainId).lean();

    const formattedDomain = {
      id: updatedDomain._id.toString(),
      name: updatedDomain.name,
      status: updatedDomain.status,
      cnameType: updatedDomain.cnameType || 'CNAME',
      cnameName: updatedDomain.cnameName || 'pay',
      cnameValue: updatedDomain.cnameValue || 'checkout.insanepay.com.br'
    };

    res.status(200).json({
      data: {
        message: 'Produto associado com sucesso',
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar produto ao domínio:', error);
    
    if (error.code === 11000) {
      return next(errorHandler(400, 'Associação já existe', 'Este produto já está associado a este domínio'));
    }
    
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Remover produto de um domínio
 * @route   DELETE /api/domains/:domainId/remove-product
 * @access  Private
 */
export const removeProductFromDomain = async (req, res, next) => {
  try {
    const { domainId } = req.params;
    const userId = req.user._id;
    // Aceitar productId de query params (padrão HTTP DELETE) ou body
    const { productId } = req.query.productId ? { productId: req.query.productId } : req.body;

    // Validar dados
    if (!productId) {
      return next(errorHandler(400, 'Dados inválidos', 'productId é obrigatório'));
    }

    // Validar que o domínio existe e pertence ao usuário
    const domain = await Domain.findOne({ _id: domainId, userId });
    if (!domain) {
      return next(errorHandler(404, 'Domínio não encontrado', 'Domínio não foi encontrado ou você não tem permissão'));
    }

    // Validar que o produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar e deletar associação
    const productDomain = await ProductDomain.findOneAndDelete({
      productId,
      domainId,
      userId
    });

    if (!productDomain) {
      return next(errorHandler(404, 'Associação não encontrada', 'Este produto não está associado a este domínio'));
    }

    console.log(`🗑️ Produto ${productId} removido do domínio ${domainId}`);

    // Buscar domínio atualizado
    const updatedDomain = await Domain.findById(domainId).lean();

    const formattedDomain = {
      id: updatedDomain._id.toString(),
      name: updatedDomain.name,
      status: updatedDomain.status,
      cnameType: updatedDomain.cnameType || 'CNAME',
      cnameName: updatedDomain.cnameName || 'pay',
      cnameValue: updatedDomain.cnameValue || 'checkout.insanepay.com.br'
    };

    res.status(200).json({
      data: {
        message: 'Produto removido com sucesso',
        domain: formattedDomain
      }
    });

  } catch (error) {
    console.error('❌ Erro ao remover produto do domínio:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

