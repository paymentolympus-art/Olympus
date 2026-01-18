import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage,
  activateProduct,
  updateProductStatus,
  validateProduct,
  activatePendingProducts
} from '../controllers/productController.js';
import { authenticate } from '../middlewares/auth.js'; // Middleware de autenticação
import { validate, createProductSchema, updateProductSchema } from '../middlewares/validation.js';
// Usar upload apropriado conforme ambiente (Vercel ou local)
import { uploadProductImage as uploadProductImageVercel } from '../middlewares/uploadVercel.js';
import { uploadProductImage as uploadProductImageLocal } from '../middlewares/upload.js';

// Escolher middleware baseado no ambiente
const uploadMiddleware = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN
  ? uploadProductImageVercel
  : uploadProductImageLocal;
import { getOrderbumpAvailable } from '../controllers/orderbumpController.js';

const router = express.Router();

/**
 * Todas as rotas de produtos requerem autenticação
 * O middleware 'protect' adiciona req.user com os dados do usuário autenticado
 */

/**
 * @route   POST /api/products
 * @desc    Criar um novo produto
 * @access  Private
 */
router.post('/', authenticate, validate(createProductSchema), createProduct);

/**
 * @route   GET /api/products
 * @desc    Listar produtos do usuário logado (com filtros e paginação)
 * @access  Private
 */
router.get('/', authenticate, getProducts);

/**
 * @route   GET /api/products/:productId/order-bumps
 * @desc    Listar produtos e ofertas disponíveis para criar orderbump
 * @access  Private
 * 
 * IMPORTANTE: Esta rota deve ser registrada ANTES da rota /:id
 * para evitar conflito de rotas (Express pode interpretar "order-bumps" como ID)
 */
router.get('/:productId/order-bumps', authenticate, getOrderbumpAvailable);

/**
 * @route   GET /api/products/:id
 * @desc    Buscar produto por ID
 * @access  Private
 */
router.get('/:id', authenticate, getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Atualizar produto
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateProductSchema), updateProduct);

/**
 * @route   PATCH /api/products/:id/activate
 * @desc    Ativar produto (valida requisitos)
 * @access  Private
 */
router.patch('/:id/activate', authenticate, activateProduct);

/**
 * @route   PATCH /api/products/:id/status
 * @desc    Atualizar status do produto
 * @access  Private
 */
router.patch('/:id/status', authenticate, updateProductStatus);

/**
 * @route   GET /api/products/:id/validation
 * @desc    Validar requisitos para ativar produto
 * @access  Private
 */
router.get('/:id/validation', authenticate, validateProduct);

/**
 * @route   POST /api/products/activate-pending
 * @desc    Ativar todos produtos pendentes que já têm oferta padrão
 * @access  Private
 */
router.post('/activate-pending', authenticate, activatePendingProducts);

/**
 * @route   GET /api/products/activate-pending
 * @desc    Ativar produtos pendentes (também aceita GET para facilitar teste)
 * @access  Private
 */
router.get('/activate-pending', authenticate, activatePendingProducts);

/**
 * @route   DELETE /api/products/:id
 * @desc    Deletar produto
 * @access  Private
 */
router.delete('/:id', authenticate, deleteProduct);

/**
 * @route   POST /api/products/:id/image
 * @desc    Upload de imagem do produto
 * @access  Private
 */
router.post('/:id/image', authenticate, uploadMiddleware, uploadProductImage);

/**
 * @route   DELETE /api/products/:id/image
 * @desc    Remover imagem do produto
 * @access  Private
 */
router.delete('/:id/image', authenticate, removeProductImage);

export default router;

