import express from 'express';
import {
  getPublicCheckout,
  verifyDomainAccess
} from '../controllers/publicCheckoutController.js';

const router = express.Router();

/**
 * Rotas de Checkout Público
 * Não requerem autenticação
 * 
 * Usadas quando alguém acessa:
 * - https://pay.seudominio.com.br/slug-da-oferta
 */

/**
 * @route   GET /checkout/verify-domain
 * @desc    Verificar se domínio está configurado
 * @access  Public
 */
router.get('/verify-domain', verifyDomainAccess);

/**
 * @route   GET /checkout/:slug
 * @desc    Buscar checkout público por slug da oferta
 * @access  Public
 */
router.get('/:slug', getPublicCheckout);

export default router;

