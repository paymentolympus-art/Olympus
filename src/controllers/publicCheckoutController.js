import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Orderbump from '../models/Orderbump.js';
import CheckoutTheme from '../models/CheckoutTheme.js';
import Domain from '../models/Domain.js';
import ProductDomain from '../models/ProductDomain.js';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * @desc    Buscar checkout público por slug da oferta
 * @route   GET /checkout/:slug
 * @access  Public (não requer autenticação)
 * 
 * Esta rota é acessada quando alguém visita:
 * - https://pay.seudominio.com.br/slug-da-oferta
 * - O domínio aponta para checkout.olympuspayment.com.br
 * - O servidor identifica o domínio e busca o checkout correspondente
 */
export const getPublicCheckout = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const host = req.headers.host || req.headers['x-forwarded-host'] || '';

    console.log(`🔍 Checkout público requisitado:`);
    console.log(`   Host: ${host}`);
    console.log(`   Slug: ${slug}`);

    // Buscar oferta pelo slug
    const offer = await Offer.findOne({ slug }).lean();

    console.log(`   Oferta encontrada: ${offer ? 'SIM' : 'NÃO'}`);
    if (offer) {
      console.log(`   Oferta ID: ${offer._id}`);
      console.log(`   Oferta productId: ${offer.productId}`);
      console.log(`   Oferta userId: ${offer.userId}`);
    }

    if (!offer) {
      return res.status(404).json({
        error: 'Oferta não encontrada',
        message: 'A oferta solicitada não existe ou foi removida',
        slug
      });
    }

    const productId = offer.productId;
    const userId = offer.userId;

    // Buscar produto
    console.log(`   Buscando produto com ID: ${productId}`);
    const product = await Product.findOne({ _id: productId }).lean();

    console.log(`   Produto encontrado: ${product ? 'SIM' : 'NÃO'}`);
    if (product) {
      console.log(`   Produto nome: ${product.name}`);
      console.log(`   Produto status: ${product.status}`);
    }

    if (!product) {
      // Tentar buscar todas as ofertas para debug
      const allOffers = await Offer.find({ slug }).lean();
      console.log(`   Todas ofertas com slug '${slug}':`, allOffers.length);
      
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'O produto desta oferta não existe ou foi removido',
        debug: {
          offerId: offer._id,
          productId: offer.productId,
          slug: offer.slug
        }
      });
    }

    // Verificar se produto está ativo
    if (product.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Produto indisponível',
        message: 'Este produto não está disponível para compra no momento'
      });
    }

    // Buscar orderbumps ativos
    const orderbumps = await Orderbump.find({ productId, status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .lean();

    // Buscar tema do checkout
    let theme = await CheckoutTheme.findOne({ productId }).lean();

    if (!theme) {
      // Criar tema padrão se não existir
      theme = {
        theme: 'SHOP',
        steps: 'three',
        font: 'Rubik',
        radius: 'rounded',
        cartVisible: true,
        socialProofs: [],
        defaultImages: {
          favicon: null,
          logo: null,
          logoPosition: 'left',
          bannerDesktop: null,
          bannerMobile: null
        },
        defaultTexts: {},
        defaultSnippets: {},
        defaultColors: {},
        defaultMargins: {},
        defaultSizes: {}
      };
    }

    // Formatar imagem do produto
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    let imageUrl = product.imageUrl || null;
    if (imageUrl) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        if (imageUrl.includes('localhost') && process.env.BACKEND_URL) {
          imageUrl = imageUrl.replace(/http:\/\/localhost:\d+/, process.env.BACKEND_URL);
        }
      } else if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `${backendUrl}${imageUrl}`;
      }
    }

    // Formatar orderbumps
    const formattedOrderbumps = orderbumps.map(ob => {
      let obImage = ob.imageUrl || null;
      if (obImage) {
        if (obImage.startsWith('http://') || obImage.startsWith('https://')) {
          if (obImage.includes('localhost') && process.env.BACKEND_URL) {
            obImage = obImage.replace(/http:\/\/localhost:\d+/, process.env.BACKEND_URL);
          }
        } else if (obImage.startsWith('/uploads/')) {
          obImage = `${backendUrl}${obImage}`;
        }
      }

      return {
        id: ob._id.toString(),
        name: ob.name,
        description: ob.description,
        image: obImage || '',
        callToAction: ob.callToAction,
        price: ob.price,
        priceFake: ob.priceFake || 0
      };
    });

    // Formatar oferta
    const formattedOffer = {
      id: offer._id.toString(),
      name: offer.name,
      description: offer.description || '',
      slug: offer.slug,
      price: offer.price,
      priceFake: offer.priceFake || 0,
      discount: offer.discount || 0
    };

    // Formatar produto
    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      type: product.type,
      paymentFormat: product.paymentFormat,
      description: product.description || '',
      image: imageUrl,
      urlBack: product.urlBack || '',
      urlRedirect: product.urlRedirect || '',
      offer: formattedOffer,
      orderBumps: formattedOrderbumps,
      shippingOptions: []
    };

    // Formatar tema
    const formattedTheme = {
      theme: theme.theme || 'SHOP',
      steps: theme.steps || 'three',
      font: theme.font || 'Rubik',
      radius: theme.radius || 'rounded',
      cartVisible: theme.cartVisible !== undefined ? theme.cartVisible : true,
      socialProofs: theme.socialProofs || [],
      defaultImages: {
        favicon: theme.defaultImages?.favicon || null,
        logo: theme.defaultImages?.logo || null,
        logoPosition: theme.defaultImages?.logoPosition || 'left',
        bannerDesktop: theme.defaultImages?.bannerDesktop || null,
        bannerMobile: theme.defaultImages?.bannerMobile || null
      },
      defaultTexts: theme.defaultTexts || {},
      defaultSnippets: theme.defaultSnippets || {},
      defaultColors: theme.defaultColors || {},
      defaultMargins: theme.defaultMargins || {},
      defaultSizes: theme.defaultSizes || {}
    };

    // Formatar URLs das imagens do tema
    if (formattedTheme.defaultImages.logo && formattedTheme.defaultImages.logo.startsWith('/uploads/')) {
      formattedTheme.defaultImages.logo = `${backendUrl}${formattedTheme.defaultImages.logo}`;
    }
    if (formattedTheme.defaultImages.favicon && formattedTheme.defaultImages.favicon.startsWith('/uploads/')) {
      formattedTheme.defaultImages.favicon = `${backendUrl}${formattedTheme.defaultImages.favicon}`;
    }
    if (formattedTheme.defaultImages.bannerDesktop && formattedTheme.defaultImages.bannerDesktop.startsWith('/uploads/')) {
      formattedTheme.defaultImages.bannerDesktop = `${backendUrl}${formattedTheme.defaultImages.bannerDesktop}`;
    }
    if (formattedTheme.defaultImages.bannerMobile && formattedTheme.defaultImages.bannerMobile.startsWith('/uploads/')) {
      formattedTheme.defaultImages.bannerMobile = `${backendUrl}${formattedTheme.defaultImages.bannerMobile}`;
    }

    console.log(`✅ Checkout público encontrado: ${product.name} - ${offer.name}`);

    res.status(200).json({
      data: {
        product: formattedProduct,
        theme: formattedTheme
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar checkout público:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Verificar se domínio está configurado corretamente
 * @route   GET /checkout/verify-domain
 * @access  Public
 */
export const verifyDomainAccess = async (req, res, next) => {
  try {
    const host = req.headers.host || req.headers['x-forwarded-host'] || '';

    console.log(`🔍 Verificação de domínio: ${host}`);

    // Extrair subdomínio e domínio principal
    // Ex: pay.testandogat.shop -> subdomínio: pay, domínio: testandogat.shop
    const parts = host.split('.');
    
    if (parts.length < 2) {
      return res.status(400).json({
        error: 'Domínio inválido',
        message: 'Formato de domínio inválido',
        host
      });
    }

    const subdomain = parts[0]; // ex: 'pay'
    const mainDomain = parts.slice(1).join('.'); // ex: 'testandogat.shop'

    // Buscar domínio no sistema
    const domain = await Domain.findOne({ 
      name: mainDomain,
      cnameName: subdomain,
      status: 'VERIFIED'
    }).lean();

    if (!domain) {
      return res.status(404).json({
        error: 'Domínio não encontrado',
        message: 'Este domínio não está configurado ou não foi verificado',
        host,
        subdomain,
        mainDomain
      });
    }

    // Buscar produtos associados ao domínio
    const productDomains = await ProductDomain.find({ domainId: domain._id })
      .populate('productId')
      .lean();

    const products = productDomains
      .filter(pd => pd.productId)
      .map(pd => ({
        id: pd.productId._id.toString(),
        name: pd.productId.name,
        status: pd.productId.status
      }));

    res.status(200).json({
      data: {
        domain: {
          id: domain._id.toString(),
          name: domain.name,
          subdomain: domain.cnameName,
          fullDomain: `${domain.cnameName}.${domain.name}`,
          status: domain.status
        },
        products,
        message: 'Domínio configurado corretamente!'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar domínio:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

