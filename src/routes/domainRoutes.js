import express from 'express';
import {
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  verifyDomain,
  getDomainsByProduct,
  associateProducts,
  addProductToDomain,
  removeProductFromDomain
} from '../controllers/domainController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Rotas de Domínios
 * Todas requerem autenticação
 */

/**
 * @route   GET /api/domains
 * @desc    Listar domínios com filtros e paginação
 * @access  Private
 */
router.get('/', authenticate, getDomains);

/**
 * @route   GET /api/domains/:id
 * @desc    Buscar domínio por ID
 * @access  Private
 */
router.get('/:id', authenticate, getDomainById);

/**
 * @route   POST /api/domains
 * @desc    Criar domínio
 * @access  Private
 */
router.post('/', authenticate, createDomain);

/**
 * @route   PUT /api/domains/:id
 * @desc    Atualizar domínio
 * @access  Private
 */
router.put('/:id', authenticate, updateDomain);

/**
 * @route   DELETE /api/domains/:id
 * @desc    Deletar domínio
 * @access  Private
 */
router.delete('/:id', authenticate, deleteDomain);

/**
 * @route   POST /api/domains/:id/verify
 * @desc    Verificar domínio (consultar DNS)
 * @access  Private
 */
router.post('/:id/verify', authenticate, verifyDomain);

/**
 * @route   GET /api/domains/product/:productId
 * @desc    Listar domínios de um produto
 * @access  Private
 */
router.get('/product/:productId', authenticate, getDomainsByProduct);

/**
 * @route   POST /api/domains/:domainId/associate-products
 * @desc    Associar produtos em massa a um domínio
 * @access  Private
 */
router.post('/:domainId/associate-products', authenticate, associateProducts);

/**
 * @route   POST /api/domains/:domainId/add-product
 * @desc    Adicionar produto individual a um domínio
 * @access  Private
 */
router.post('/:domainId/add-product', authenticate, addProductToDomain);

/**
 * @route   DELETE /api/domains/:domainId/remove-product?productId=:productId
 * @desc    Remover produto de um domínio
 * @access  Private
 * @note    Aceita productId via query param ou body
 */
router.delete('/:domainId/remove-product', authenticate, removeProductFromDomain);

export default router;

