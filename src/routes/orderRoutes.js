import express from 'express';
import { createOrder, getOrderStatus } from '../controllers/orderController.js';
import { validate, createOrderSchema } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Criar um novo pedido e gerar QR Code PIX
 * @access  Public (checkout público)
 * 
 * Body esperado:
 * {
 *   "userId": "string (opcional, ObjectId)",
 *   "amount": number (obrigatório, ex: 99.90),
 *   "description": "string (opcional)",
 *   "payerEmail": "string (obrigatório, email do pagador)",
 *   "items": [array opcional de { name, quantity, price }]
 * }
 * 
 * Response 201:
 * {
 *   "data": {
 *     "orderId": "string",
 *     "status": "PENDING",
 *     "pixQrCode": "string (base64)",
 *     "pixCode": "string (copia e cola)",
 *     "expiresAt": "ISO date string",
 *     "amount": number,
 *     "description": "string"
 *   }
 * }
 */
router.post('/', validate(createOrderSchema), createOrder);

/**
 * @route   GET /api/orders/:orderId/status
 * @desc    Consultar status de um pedido
 * @access  Public (checkout público, usado para polling)
 * 
 * Parâmetros:
 * - orderId: ObjectId do MongoDB
 * 
 * Lógica:
 * 1. Busca Order no MongoDB
 * 2. Se não encontrado → 404
 * 3. Se status já for PAID ou EXPIRED → retorna imediatamente (sem consultar MP)
 * 4. Se status for PENDING:
 *    - Consulta status no Mercado Pago
 *    - Atualiza Order se necessário
 * 5. Retorna status atualizado
 * 
 * Response 200:
 * {
 *   "status": "PENDING" | "PAID" | "EXPIRED",
 *   "orderId": "string",
 *   "amount": number,
 *   "updatedAt": "ISO date string",
 *   "message": "string (opcional)"
 * }
 * 
 * Response 404:
 * {
 *   "error": "Pedido não encontrado",
 *   "message": "Pedido com ID ... não foi encontrado"
 * }
 */
router.get('/:orderId/status', getOrderStatus);

export default router;

