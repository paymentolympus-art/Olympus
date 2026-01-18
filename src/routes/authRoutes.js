import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getUserMe, 
  getUserAwards,
  getUserMetrics,
  getUserAnalyticsChart,
  getUserDocuments
} from '../controllers/authController.js';
import { validate, loginSchema, registerUserSchema } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /auth/session
 * @desc    Login do usuário
 * @access  Public
 * 
 * Body esperado:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 * 
 * Response 200:
 * {
 *   "data": {
 *     "session": "jwt-token",
 *     "user": {
 *       "id": "string",
 *       "name": "string",
 *       "email": "string",
 *       "accountType": "PERSON" | "COMPANY",
 *       "status": "ACTIVE",
 *       ...
 *     },
 *     "message": "Login realizado com sucesso!"
 *   }
 * }
 */
router.post('/session', validate(loginSchema), loginUser);

/**
 * @route   POST /user/create
 * @desc    Registrar novo usuário (PF ou PJ)
 * @access  Public
 * 
 * Body esperado (Pessoa Física):
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string",
 *   "accountType": "PERSON",
 *   "cpf": "string (sem formatação)",
 *   "phone": "string (sem formatação)",
 *   "birthDate": "YYYY-MM-DD",
 *   "acceptTerms": true
 * }
 * 
 * Body esperado (Pessoa Jurídica):
 * {
 *   "name": "string",
 *   "email": "string",
 *   "password": "string",
 *   "accountType": "COMPANY",
 *   "cnpj": "string (sem formatação)",
 *   "companyName": "string",
 *   "tradeName": "string",
 *   "phone": "string (sem formatação)",
 *   "acceptTerms": true
 * }
 * 
 * Response 201:
 * {
 *   "data": {
 *     "message": "Usuário criado com sucesso!",
 *     "user": {
 *       "id": "string",
 *       "name": "string",
 *       "email": "string",
 *       "accountType": "PERSON" | "COMPANY",
 *       "status": "ACTIVE"
 *     }
 *   }
 * }
 */
router.post('/create', validate(registerUserSchema), registerUser);

/**
 * @route   GET /user/me
 * @desc    Buscar dados do usuário logado
 * @access  Private (requer autenticação)
 * 
 * Headers:
 * Authorization: Bearer {token}
 * 
 * Response 200:
 * {
 *   "data": {
 *     "id": "string",
 *     "name": "string",
 *     "email": "string",
 *     "accountType": "PERSON" | "COMPANY",
 *     "status": "ACTIVE",
 *     ...
 *   }
 * }
 */
router.get('/me', authenticate, getUserMe);
router.get('/me/awards', authenticate, getUserAwards);
router.get('/me/metrics', authenticate, getUserMetrics);
router.get('/me/analytics/chart', authenticate, getUserAnalyticsChart);
router.get('/me/documents', authenticate, getUserDocuments);

export default router;

