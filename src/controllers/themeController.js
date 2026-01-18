import CheckoutTheme from '../models/CheckoutTheme.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Orderbump from '../models/Orderbump.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { uploadToVercelBlob } from '../middlewares/uploadVercel.js';

/**
 * @desc    Buscar dados completos do checkout (produto + tema)
 * @route   GET /theme/settings/:productId
 * @access  Private
 */
export const getCheckoutSettings = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Buscar produto
    const product = await Product.findOne({ _id: productId, userId }).lean();

    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar oferta padrão
    const defaultOffer = await Offer.findOne({ productId, isDefault: true, userId }).lean();
    
    if (!defaultOffer) {
      return next(errorHandler(404, 'Oferta padrão não encontrada', 'O produto precisa ter uma oferta padrão configurada'));
    }

    // Buscar orderbumps ativos
    const orderbumps = await Orderbump.find({ productId, status: 'ACTIVE', userId })
      .sort({ createdAt: -1 })
      .lean();

    // Buscar tema (ou criar padrão se não existir)
    let theme = await CheckoutTheme.findOne({ productId, userId }).lean();

    if (!theme) {
      // Criar tema padrão
      const newTheme = new CheckoutTheme({
        productId,
        userId
      });
      await newTheme.save();
      theme = newTheme.toObject();
    }

    // Formatar produto para checkout
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    // Formatar imagem do produto
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
        price: ob.price.toString(),
        priceFake: (ob.priceFake || 0).toString()
      };
    });

    // Formatar oferta
    const formattedOffer = {
      id: defaultOffer._id.toString(),
      name: defaultOffer.name,
      description: defaultOffer.description || '',
      slug: defaultOffer.slug,
      price: defaultOffer.price.toString(),
      priceFake: (defaultOffer.priceFake || 0).toString()
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

    // Produto formatado
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
      shippingOptions: [] // Por enquanto vazio (futuro)
    };

    res.status(200).json({
      data: {
        data: {
          product: formattedProduct,
          theme: formattedTheme
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do checkout:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Atualizar tema do checkout
 * @route   PUT /theme/:productId/theme
 * @access  Private
 */
export const updateCheckoutTheme = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const {
      theme,
      steps,
      font,
      radius,
      cartVisible,
      defaultTexts,
      defaultSnippets,
      defaultColors,
      defaultMargins,
      defaultSizes
    } = req.body;

    // Verificar se produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar ou criar tema
    let checkoutTheme = await CheckoutTheme.findOne({ productId, userId });

    if (!checkoutTheme) {
      checkoutTheme = new CheckoutTheme({
        productId,
        userId
      });
    }

    // Atualizar campos
    if (theme !== undefined) checkoutTheme.theme = theme;
    if (steps !== undefined) checkoutTheme.steps = steps;
    if (font !== undefined) checkoutTheme.font = font;
    if (radius !== undefined) checkoutTheme.radius = radius;
    if (cartVisible !== undefined) checkoutTheme.cartVisible = cartVisible;
    if (defaultTexts) checkoutTheme.defaultTexts = { ...checkoutTheme.defaultTexts, ...defaultTexts };
    if (defaultSnippets) checkoutTheme.defaultSnippets = { ...checkoutTheme.defaultSnippets, ...defaultSnippets };
    if (defaultColors) checkoutTheme.defaultColors = { ...checkoutTheme.defaultColors, ...defaultColors };
    if (defaultMargins) checkoutTheme.defaultMargins = { ...checkoutTheme.defaultMargins, ...defaultMargins };
    if (defaultSizes) checkoutTheme.defaultSizes = { ...checkoutTheme.defaultSizes, ...defaultSizes };

    await checkoutTheme.save();

    console.log(`✅ Tema do checkout atualizado: ${productId}`);

    // Retornar tema formatado
    const themeObj = checkoutTheme.toJSON();
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Formatar URLs das imagens
    if (themeObj.defaultImages) {
      if (themeObj.defaultImages.logo && themeObj.defaultImages.logo.startsWith('/uploads/')) {
        themeObj.defaultImages.logo = `${backendUrl}${themeObj.defaultImages.logo}`;
      }
      if (themeObj.defaultImages.favicon && themeObj.defaultImages.favicon.startsWith('/uploads/')) {
        themeObj.defaultImages.favicon = `${backendUrl}${themeObj.defaultImages.favicon}`;
      }
      if (themeObj.defaultImages.bannerDesktop && themeObj.defaultImages.bannerDesktop.startsWith('/uploads/')) {
        themeObj.defaultImages.bannerDesktop = `${backendUrl}${themeObj.defaultImages.bannerDesktop}`;
      }
      if (themeObj.defaultImages.bannerMobile && themeObj.defaultImages.bannerMobile.startsWith('/uploads/')) {
        themeObj.defaultImages.bannerMobile = `${backendUrl}${themeObj.defaultImages.bannerMobile}`;
      }
    }

    res.status(200).json({
      data: themeObj
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tema do checkout:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Upload de asset (logo, favicon, banner)
 * @route   POST /theme/:productId/assets/:assetType
 * @access  Private
 */
export const uploadAsset = async (req, res, next) => {
  try {
    const { productId, assetType } = req.params;
    const userId = req.user._id;

    // Validar assetType
    const validAssetTypes = ['logo', 'favicon', 'banner_desktop', 'banner_mobile'];
    if (!validAssetTypes.includes(assetType)) {
      return next(errorHandler(400, 'Tipo de asset inválido', `Tipo deve ser um de: ${validAssetTypes.join(', ')}`));
    }

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return next(errorHandler(400, 'Arquivo não fornecido', 'Por favor, envie um arquivo de imagem'));
    }

    // Verificar se produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar ou criar tema
    let checkoutTheme = await CheckoutTheme.findOne({ productId, userId });

    if (!checkoutTheme) {
      checkoutTheme = new CheckoutTheme({
        productId,
        userId
      });
    }

    // Upload para Vercel Blob ou filesystem local
    const isVercel = process.env.VERCEL === '1' || !process.env.BACKEND_URL?.includes('localhost');
    let imageUrl;

    if (isVercel && process.env.BLOB_READ_WRITE_TOKEN) {
      // PRODUÇÃO: Usar Vercel Blob Storage
      try {
        imageUrl = await uploadToVercelBlob(
          req.file.buffer,
          req.file.originalname,
          'checkout-assets'
        );
        console.log(`✅ Asset enviado para Vercel Blob: ${imageUrl}`);
      } catch (blobError) {
        console.error('❌ Erro ao fazer upload para Vercel Blob:', blobError);
        return next(errorHandler(500, 'Erro ao fazer upload do asset', blobError.message));
      }
    } else {
      // DESENVOLVIMENTO LOCAL: Usar sistema de arquivos
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    }

    // Atualizar imagem correspondente
    const imageFieldMap = {
      'logo': 'defaultImages.logo',
      'favicon': 'defaultImages.favicon',
      'banner_desktop': 'defaultImages.bannerDesktop',
      'banner_mobile': 'defaultImages.bannerMobile'
    };

    // Remover imagem antiga se existir (apenas em local)
    if (!isVercel && checkoutTheme.defaultImages) {
      const oldImageField = imageFieldMap[assetType];
      if (oldImageField) {
        const oldImage = checkoutTheme.defaultImages[oldImageField.split('.')[1]];
        if (oldImage && oldImage.startsWith('/uploads/')) {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath } = await import('url');
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const oldImagePath = path.join(__dirname, '../../', oldImage);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.warn('⚠️  Erro ao remover imagem antiga:', err.message);
          }
        }
      }
    }

    // Atualizar campo
    if (assetType === 'logo') {
      checkoutTheme.defaultImages.logo = imageUrl;
    } else if (assetType === 'favicon') {
      checkoutTheme.defaultImages.favicon = imageUrl;
    } else if (assetType === 'banner_desktop') {
      checkoutTheme.defaultImages.bannerDesktop = imageUrl;
    } else if (assetType === 'banner_mobile') {
      checkoutTheme.defaultImages.bannerMobile = imageUrl;
    }

    await checkoutTheme.save();

    console.log(`✅ Asset ${assetType} atualizado: ${productId}`);

    // Retornar resposta formatada
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    let formattedImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      formattedImageUrl = `${backendUrl}${imageUrl}`;
    }

    res.status(200).json({
      message: 'Asset enviado com sucesso',
      data: {
        assetType,
        url: formattedImageUrl,
        specs: {
          maxWidth: 2000,
          maxHeight: 2000,
          maxSize: 5 * 1024 * 1024, // 5MB
          acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        },
        theme: checkoutTheme.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload do asset:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Remover asset (logo, favicon, banner)
 * @route   DELETE /theme/:productId/assets/:assetType
 * @access  Private
 */
export const removeAsset = async (req, res, next) => {
  try {
    const { productId, assetType } = req.params;
    const userId = req.user._id;

    // Validar assetType
    const validAssetTypes = ['logo', 'favicon', 'banner_desktop', 'banner_mobile'];
    if (!validAssetTypes.includes(assetType)) {
      return next(errorHandler(400, 'Tipo de asset inválido', `Tipo deve ser um de: ${validAssetTypes.join(', ')}`));
    }

    // Verificar se produto existe e pertence ao usuário
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return next(errorHandler(404, 'Produto não encontrado', 'Produto não foi encontrado ou você não tem permissão'));
    }

    // Buscar tema
    const checkoutTheme = await CheckoutTheme.findOne({ productId, userId });

    if (!checkoutTheme) {
      return next(errorHandler(404, 'Tema não encontrado', 'Tema do checkout não foi encontrado'));
    }

    // Remover imagem do filesystem se existir (apenas em local)
    const isVercel = process.env.VERCEL === '1' || !process.env.BACKEND_URL?.includes('localhost');
    
    if (!isVercel && checkoutTheme.defaultImages) {
      let imageToRemove = null;
      if (assetType === 'logo') imageToRemove = checkoutTheme.defaultImages.logo;
      else if (assetType === 'favicon') imageToRemove = checkoutTheme.defaultImages.favicon;
      else if (assetType === 'banner_desktop') imageToRemove = checkoutTheme.defaultImages.bannerDesktop;
      else if (assetType === 'banner_mobile') imageToRemove = checkoutTheme.defaultImages.bannerMobile;

      if (imageToRemove && imageToRemove.startsWith('/uploads/')) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const { fileURLToPath } = await import('url');
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const imagePath = path.join(__dirname, '../../', imageToRemove);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.warn('⚠️  Erro ao remover arquivo:', err.message);
        }
      }
    }

    // Limpar campo
    if (assetType === 'logo') {
      checkoutTheme.defaultImages.logo = null;
    } else if (assetType === 'favicon') {
      checkoutTheme.defaultImages.favicon = null;
    } else if (assetType === 'banner_desktop') {
      checkoutTheme.defaultImages.bannerDesktop = null;
    } else if (assetType === 'banner_mobile') {
      checkoutTheme.defaultImages.bannerMobile = null;
    }

    await checkoutTheme.save();

    console.log(`🗑️ Asset ${assetType} removido: ${productId}`);

    res.status(200).json({
      message: 'Asset removido com sucesso',
      data: {
        assetType,
        removed: true
      }
    });

  } catch (error) {
    console.error('❌ Erro ao remover asset:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

