import express from 'express';
import {
  getIntegrationsByProduct,
  getUnassociatedIntegrations,
  associateIntegrationToProduct,
  removeIntegrationFromProduct
} from '../controllers/integrationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Rotas relacionadas a integrações e produtos
 * Todas requerem autenticação
 */

/**
 * @route   GET /api/integrations/products/:productId
 * @desc    Listar integrações de um produto
 * @access  Private
 */
router.get('/products/:productId', authenticate, getIntegrationsByProduct);

/**
 * @route   GET /api/integrations/unassociated/:productId
 * @desc    Listar integrações não associadas ao produto
 * @access  Private
 */
router.get('/unassociated/:productId', authenticate, getUnassociatedIntegrations);

/**
 * @route   POST /api/integrations/associate
 * @desc    Associar integração a produto
 * @access  Private
 */
router.post('/associate', authenticate, associateIntegrationToProduct);

/**
 * @route   DELETE /api/integrations/:integrationId/product/:productId
 * @desc    Remover associação de integração com produto
 * @access  Private
 */
router.delete('/:integrationId/product/:productId', authenticate, removeIntegrationFromProduct);

export default router;



