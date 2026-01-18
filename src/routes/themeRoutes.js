import express from 'express';
import {
  getCheckoutSettings,
  updateCheckoutTheme,
  uploadAsset,
  removeAsset,
  getUserThemes
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/auth.js';

// Usar upload apropriado conforme ambiente (Vercel ou local)
import { uploadProductImage as uploadAssetVercel } from '../middlewares/uploadVercel.js';
import { uploadProductImage as uploadAssetLocal } from '../middlewares/upload.js';

// Escolher middleware baseado no ambiente
const uploadAssetMiddleware = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN
  ? uploadAssetVercel
  : uploadAssetLocal;

const router = express.Router();

/**
 * Rotas de Tema de Checkout
 * Todas requerem autenticação
 */

/**
 * @route   GET /theme/user-themes
 * @desc    Listar temas disponíveis (SIMPLE, SHOP, SELECT)
 * @access  Private
 */
router.get('/user-themes', authenticate, getUserThemes);

/**
 * @route   GET /theme/settings/:productId
 * @desc    Buscar dados completos do checkout (produto + tema)
 * @access  Private
 */
router.get('/settings/:productId', authenticate, getCheckoutSettings);

/**
 * @route   PUT /theme/:productId/theme
 * @desc    Atualizar tema do checkout
 * @access  Private
 */
router.put('/:productId/theme', authenticate, updateCheckoutTheme);

/**
 * @route   POST /theme/:productId/assets/:assetType
 * @desc    Upload de asset (logo, favicon, banner_desktop, banner_mobile)
 * @access  Private
 */
router.post('/:productId/assets/:assetType', authenticate, uploadAssetMiddleware, uploadAsset);

/**
 * @route   DELETE /theme/:productId/assets/:assetType
 * @desc    Remover asset
 * @access  Private
 */
router.delete('/:productId/assets/:assetType', authenticate, removeAsset);

export default router;

