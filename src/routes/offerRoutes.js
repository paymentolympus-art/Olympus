import express from 'express';
import {
  createOffer,
  createDefaultOffer,
  getOffersByProduct,
  getOfferById,
  updateOffer,
  setDefaultOffer,
  deleteOffer
} from '../controllers/offerController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.post('/', authenticate, createOffer);
router.post('/default/:productId', authenticate, createDefaultOffer);
router.get('/product/:productId', authenticate, getOffersByProduct);
router.get('/:id', authenticate, getOfferById);
router.put('/:id', authenticate, updateOffer);
router.patch('/:id/default', authenticate, setDefaultOffer);
router.delete('/:id', authenticate, deleteOffer);

export default router;

