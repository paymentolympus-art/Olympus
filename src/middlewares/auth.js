import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware de autenticação JWT
 * 
 * Verifica se o usuário está autenticado através do token JWT
 * no header Authorization: Bearer {token}
 * 
 * Adiciona req.user com os dados do usuário autenticado
 */
export const authenticate = async (req, res, next) => {
  try {
    // ========================================
    // 1. EXTRAIR TOKEN DO HEADER
    // ========================================
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de autenticação é obrigatório. Use: Authorization: Bearer {token}'
      });
    }

    // Extrair token (remover "Bearer ")
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autenticação não encontrado no header'
      });
    }

    // ========================================
    // 2. VERIFICAR E DECODIFICAR TOKEN JWT
    // ========================================
    
    const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui-altere-em-producao';

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          message: 'Token de autenticação expirou. Faça login novamente.'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'Token de autenticação inválido.'
        });
      }

      return res.status(401).json({
        error: 'Erro ao verificar token',
        message: 'Não foi possível verificar o token de autenticação.'
      });
    }

    // ========================================
    // 3. BUSCAR USUÁRIO NO BANCO DE DADOS
    // ========================================
    
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token não contém ID do usuário'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Usuário associado ao token não existe mais'
      });
    }

    // ========================================
    // 4. VERIFICAR STATUS DO USUÁRIO
    // ========================================
    
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Conta inativa',
        message: `Sua conta está ${user.status.toLowerCase()}. Entre em contato com o suporte.`
      });
    }

    // ========================================
    // 5. ADICIONAR USUÁRIO AO REQUEST
    // ========================================
    
    // Adicionar dados do usuário ao request para uso nas rotas
    req.user = user;
    req.userId = user._id.toString();

    // Continuar para próxima função
    next();

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Middleware opcional: Verifica autenticação mas não bloqueia se não autenticado
 * Útil para rotas que funcionam com ou sem autenticação
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui-altere-em-producao';

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId || decoded.id;

        if (userId) {
          const user = await User.findById(userId).select('-password');
          if (user && user.status === 'ACTIVE') {
            req.user = user;
            req.userId = user._id.toString();
          }
        }
      } catch (error) {
        // Ignora erros de token, continua sem autenticação
      }
    }

    next();
  } catch (error) {
    // Continua sem autenticação em caso de erro
    next();
  }
};

