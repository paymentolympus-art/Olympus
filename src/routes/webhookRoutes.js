import express from 'express';
import { handlePixWebhook } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * IMPORTANTE: Middleware raw body para validação de assinatura
 * 
 * Para validar a assinatura HMAC, precisamos do body raw (não parseado como JSON).
 * Express por padrão já parseia JSON, mas para webhooks precisamos do raw.
 * 
 * Alternativa: usar express.raw() apenas para esta rota específica.
 */

/**
 * @route   POST /webhooks/pix/payment
 * @desc    Receber webhook do Mercado Pago (notificação de pagamento PIX)
 * @access  Public (chamado pelo Mercado Pago)
 * 
 * IMPORTANTE:
 * - Sempre retorna 200 OK rapidamente (<5s)
 * - Valida assinatura para segurança
 * - Processa de forma idempotente
 * 
 * Formato do webhook:
 * {
 *   "id": number,
 *   "live_mode": boolean,
 *   "type": "payment",
 *   "date_created": "ISO string",
 *   "user_id": number,
 *   "api_version": string,
 *   "action": "payment.updated",
 *   "data": {
 *     "id": string (mpPaymentId)
 *   }
 * }
 * 
 * Headers:
 * - x-signature: ts=...,v1=... (para validação HMAC)
 * - x-request-id: string (ID único da requisição)
 * 
 * Response: 200 OK (sempre)
 */
router.post('/pix/payment', handlePixWebhook);

// Alternativa: rota genérica para todos os webhooks de pagamento
router.post('/payments', handlePixWebhook);

export default router;


