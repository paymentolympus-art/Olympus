import mongoose from 'mongoose';

/**
 * Schema de Tema de Checkout
 * 
 * Armazena todas as configurações visuais e funcionais do checkout
 * para um produto específico
 */
const checkoutThemeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID do produto é obrigatório'],
    unique: true, // Um produto tem apenas um tema
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    index: true
  },
  
  // Tema principal (SIMPLE, SHOP, SELECT)
  theme: {
    type: String,
    enum: ['SIMPLE', 'SHOP', 'SELECT'],
    default: 'SHOP'
  },
  
  // Número de passos (three, single, automatic-api)
  steps: {
    type: String,
    enum: ['three', 'single', 'automatic-api'],
    default: 'three'
  },
  
  // Fonte (Rubik, Inter, Poppins)
  font: {
    type: String,
    enum: ['Rubik', 'Inter', 'Poppins'],
    default: 'Rubik'
  },
  
  // Raio das bordas (square, rounded)
  radius: {
    type: String,
    enum: ['square', 'rounded'],
    default: 'rounded'
  },
  
  // Cart visível ou não
  cartVisible: {
    type: Boolean,
    default: true
  },
  
  // Social Proofs (depoimentos/testemunhos)
  socialProofs: [{
    id: String,
    image: String,
    rating: Number,
    name: String,
    text: String
  }],
  
  // Imagens padrão (logo, favicon, banners)
  defaultImages: {
    favicon: {
      type: String,
      default: null
    },
    logo: {
      type: String,
      default: null
    },
    logoPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left'
    },
    bannerDesktop: {
      type: String,
      default: null
    },
    bannerMobile: {
      type: String,
      default: null
    }
  },
  
  // Textos padrão do checkout
  defaultTexts: {
    titlePageText: { type: String, default: 'Checkout de pagamento' },
    buttonText: { type: String, default: 'Finalizar compra' },
    idText: { type: String, default: 'CPF' },
    noticeBarText: { type: String, default: '' },
    shopNameText: { type: String, default: '' },
    productTitleText: { type: String, default: '' },
    emailText: { type: String, default: 'E-mail' },
    addressText: { type: String, default: 'Endereço' },
    whatsappText: { type: String, default: 'WhatsApp' },
    termsText: { type: String, default: 'Termos de uso' },
    privacyPolicyText: { type: String, default: 'Política de privacidade' },
    exchangePolicyText: { type: String, default: 'Política de troca' },
    copyRightText: { type: String, default: '' }
  },
  
  // Snippets (flags de funcionalidades)
  defaultSnippets: {
    isLogo: { type: Boolean, default: true },
    isMenuFixedTop: { type: Boolean, default: false },
    isNoticeBar: { type: Boolean, default: false },
    isBanner: { type: Boolean, default: false },
    isSocialProof: { type: Boolean, default: false },
    isPayment: { type: Boolean, default: true },
    isSecurity: { type: Boolean, default: true },
    isCopyRight: { type: Boolean, default: false },
    isCountdown: { type: Boolean, default: false },
    isTerms: { type: Boolean, default: true },
    isPrivacyPolicy: { type: Boolean, default: false },
    isExchangePolicy: { type: Boolean, default: false },
    isWhatsApp: { type: Boolean, default: false },
    isEmail: { type: Boolean, default: true },
    isAddress: { type: Boolean, default: false },
    isCNPJ: { type: Boolean, default: false },
    isCardShadow: { type: Boolean, default: true },
    isButtonShadow: { type: Boolean, default: true },
    isButtonPulse: { type: Boolean, default: false },
    isFinishButtonShadow: { type: Boolean, default: true },
    isFinishButtonPulse: { type: Boolean, default: false },
    isCartDiscount: { type: Boolean, default: true },
    isSealSecurity: { type: Boolean, default: true },
    isCountProduct: { type: Boolean, default: true },
    isCountBump: { type: Boolean, default: true }
  },
  
  // Cores padrão do tema
  defaultColors: {
    headerBackground: { type: String, default: '#ffffff' },
    cardBackground: { type: String, default: '#ffffff' },
    cardText: { type: String, default: '#000000' },
    cardDescription: { type: String, default: '#666666' },
    cardPriceTotal: { type: String, default: '#000000' },
    textDiscount: { type: String, default: '#00ff00' },
    primary: { type: String, default: '#9333ea' },
    secondary: { type: String, default: '#d946ef' },
    background: { type: String, default: '#f9fafb' },
    surface: { type: String, default: '#ffffff' },
    noticeBar: { type: String, default: '#fbbf24' },
    socialProofStars: { type: String, default: '#fbbf24' },
    buttonColor: { type: String, default: '#9333ea' },
    buttonTextColor: { type: String, default: '#ffffff' },
    finishButtonColor: { type: String, default: '#9333ea' },
    finishButtonTextColor: { type: String, default: '#ffffff' },
    stepCircle: { type: String, default: '#9333ea' },
    stepText: { type: String, default: '#9333ea' },
    footerText: { type: String, default: '#666666' },
    footerBackground: { type: String, default: '#f9fafb' },
    orderBumpText: { type: String, default: '#000000' },
    orderBumpBackground: { type: String, default: '#f9fafb' },
    orderBumpBorder: { type: String, default: '#e5e7eb' },
    orderBumpButton: { type: String, default: '#9333ea' },
    orderBumpButtonText: { type: String, default: '#ffffff' },
    orderBumpPrice: { type: String, default: '#000000' },
    sealSecurityColor: { type: String, default: '#10b981' }
  },
  
  // Margens
  defaultMargins: {
    marginNoticeBar: {
      type: String,
      enum: ['2', '4', '5', '6'],
      default: '4'
    }
  },
  
  // Tamanhos
  defaultSizes: {
    sizeNoticeBar: {
      type: String,
      enum: ['base', '3xl', '2xl', 'xl', 'lg', 'sm'],
      default: 'base'
    }
  }
  
}, {
  timestamps: true,
  collection: 'checkout_themes'
});

// Índices
checkoutThemeSchema.index({ productId: 1 }, { unique: true });
checkoutThemeSchema.index({ userId: 1 });

/**
 * Método para transformar o documento em JSON
 */
checkoutThemeSchema.methods.toJSON = function() {
  const theme = this.toObject();
  delete theme.__v;
  return theme;
};

const CheckoutTheme = mongoose.model('CheckoutTheme', checkoutThemeSchema);

export default CheckoutTheme;



