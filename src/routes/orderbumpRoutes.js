import express from 'express';
import {
  createOrderbump,
  getOrderbumpsByProduct,
  updateOrderbump,
  deleteOrderbump,
  uploadOrderbumpImage,
  removeOrderbumpImage
} from '../controllers/orderbumpController.js';
import { authenticate } from '../middlewares/auth.js';
// Usar upload apropriado conforme ambiente (Vercel ou local)
import { uploadOrderbumpImage as uploadOrderbumpImageVercel } from '../middlewares/uploadVercel.js';
import { uploadOrderbumpImage as uploadOrderbumpImageLocal } from '../middlewares/upload.js';

// Escolher middleware baseado no ambiente
const uploadMiddleware = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN
  ? uploadOrderbumpImageVercel
  : uploadOrderbumpImageLocal;

const router = express.Router();

/**
 * Rotas de Orderbumps
 * Todas requerem autenticação
 * 
 * NOTA: A rota GET /api/products/:productId/order-bumps está em productRoutes.js
 * para evitar conflito de rotas
 */

/**
 * @route   POST /api/orderbumps
 * @desc    Criar um novo orderbump
 * @access  Private
 */
router.post('/', authenticate, createOrderbump);

/**
 * @route   GET /api/orderbumps/product/:productId
 * @desc    Listar orderbumps de um produto
 * @access  Private
 */
router.get('/product/:productId', authenticate, getOrderbumpsByProduct);

/**
 * @route   PUT /api/orderbumps/:orderbumpId
 * @desc    Atualizar orderbump
 * @access  Private
 */
router.put('/:orderbumpId', authenticate, updateOrderbump);

/**
 * @route   DELETE /api/orderbumps/:orderbumpId
 * @desc    Deletar orderbump
 * @access  Private
 */
router.delete('/:orderbumpId', authenticate, deleteOrderbump);

/**
 * @route   POST /api/orderbumps/:orderbumpId/image
 * @desc    Upload de imagem do orderbump
 * @access  Private
 */
router.post('/:orderbumpId/image', authenticate, uploadMiddleware, uploadOrderbumpImage);

/**
 * @route   DELETE /api/orderbumps/:orderbumpId/image
 * @desc    Remover imagem do orderbump
 * @access  Private
 */
router.delete('/:orderbumpId/image', authenticate, removeOrderbumpImage);

export default router;

