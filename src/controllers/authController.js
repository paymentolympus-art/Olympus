import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { errorHandler } from '../middlewares/errorHandler.js';

/**
 * Gerar token JWT
 */
const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui-altere-em-producao';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 dias por padrão

  return jwt.sign(
    { userId: userId.toString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * @desc    Registrar novo usuário (Pessoa Física ou Jurídica)
 * @route   POST /user/create
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      accountType,
      acceptTerms,
      // Dados PF
      cpf: cpfInput,
      birthDate,
      // Dados PJ
      cnpj: cnpjInput,
      companyName,
      tradeName,
      // Comum
      phone
    } = req.body;

    // ========================================
    // 1. VALIDAÇÕES BÁSICAS
    // ========================================
    
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (!accountType || !['PERSON', 'COMPANY'].includes(accountType)) {
      return res.status(400).json({
        error: 'Tipo de conta inválido',
        message: 'Tipo de conta deve ser PERSON ou COMPANY'
      });
    }

    if (acceptTerms !== true) {
      return res.status(400).json({
        error: 'Termos não aceitos',
        message: 'Você deve aceitar os termos de uso e política de privacidade'
      });
    }

    // ========================================
    // 2. VALIDAÇÕES ESPECÍFICAS POR TIPO
    // ========================================
    
    if (accountType === 'PERSON') {
      if (!cpfInput) {
        return res.status(400).json({
          error: 'CPF obrigatório',
          message: 'CPF é obrigatório para Pessoa Física'
        });
      }

      const cleanCpf = cpfInput.replace(/\D/g, '');
      if (!cpf.isValid(cleanCpf)) {
        return res.status(400).json({
          error: 'CPF inválido',
          message: 'CPF fornecido é inválido'
        });
      }

      if (!birthDate) {
        return res.status(400).json({
          error: 'Data de nascimento obrigatória',
          message: 'Data de nascimento é obrigatória para Pessoa Física'
        });
      }
    }

    if (accountType === 'COMPANY') {
      if (!cnpjInput || !companyName || !tradeName) {
        return res.status(400).json({
          error: 'Dados da empresa obrigatórios',
          message: 'CNPJ, nome da empresa e nome fantasia são obrigatórios para Pessoa Jurídica'
        });
      }

      const cleanCnpj = cnpjInput.replace(/\D/g, '');
      if (!cnpj.isValid(cleanCnpj)) {
        return res.status(400).json({
          error: 'CNPJ inválido',
          message: 'CNPJ fornecido é inválido'
        });
      }
    }

    // ========================================
    // 3. VALIDAR TELEFONE
    // ========================================
    
    if (!phone) {
      return res.status(400).json({
        error: 'Telefone obrigatório',
        message: 'Telefone é obrigatório'
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      return res.status(400).json({
        error: 'Telefone inválido',
        message: 'Telefone deve ter 11 dígitos'
      });
    }

    // ========================================
    // 4. VERIFICAR SE EMAIL JÁ EXISTE
    // ========================================
    
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        message: 'Este email já está cadastrado no sistema'
      });
    }

    // ========================================
    // 5. VERIFICAR SE CPF/CNPJ JÁ EXISTE
    // ========================================
    
    if (accountType === 'PERSON') {
      const cleanCpf = cpfInput.replace(/\D/g, '');
      const existingCpf = await User.findOne({ cpf: cleanCpf });

      if (existingCpf) {
        return res.status(400).json({
          error: 'CPF já cadastrado',
          message: 'Este CPF já está cadastrado no sistema'
        });
      }
    }

    if (accountType === 'COMPANY') {
      const cleanCnpj = cnpjInput.replace(/\D/g, '');
      const existingCnpj = await User.findOne({ cnpj: cleanCnpj });

      if (existingCnpj) {
        return res.status(400).json({
          error: 'CNPJ já cadastrado',
          message: 'Este CNPJ já está cadastrado no sistema'
        });
      }
    }

    // ========================================
    // 6. CRIAR DOCUMENTO USER
    // ========================================
    
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Será hashado pelo pre-save middleware
      accountType,
      phone: cleanPhone,
      acceptTerms: true,
      termsAcceptedAt: new Date(),
      emailVerified: false, // Por enquanto, não verifica email
      status: 'ACTIVE'
    };

    // Adicionar dados específicos conforme tipo
    if (accountType === 'PERSON') {
      userData.cpf = cpfInput.replace(/\D/g, '');
      userData.birthDate = new Date(birthDate);
    } else if (accountType === 'COMPANY') {
      userData.cnpj = cnpjInput.replace(/\D/g, '');
      userData.companyName = companyName.trim();
      userData.tradeName = tradeName.trim();
    }

    const user = new User(userData);

    // Salvar no banco (senha será hashada automaticamente pelo pre-save)
    await user.save();

    console.log(`✅ Usuário criado: ${user._id} (${accountType})`);

    // ========================================
    // 7. RETORNAR RESPOSTA DE SUCESSO
    // ========================================
    
    // Remover senha do objeto retornado
    const userResponse = user.toJSON();

    return res.status(201).json({
      data: {
        message: 'Usuário criado com sucesso!',
        user: {
          id: userResponse._id.toString(),
          name: userResponse.name,
          email: userResponse.email,
          accountType: userResponse.accountType,
          status: userResponse.status
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);

    // Erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));

      return res.status(400).json({
        error: 'Erro de validação',
        message: 'Dados inválidos',
        details: errors
      });
    }

    // Erro de duplicata (email único)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field} já cadastrado`,
        message: `Este ${field} já está cadastrado no sistema`
      });
    }

    next(error);
  }
};

/**
 * @desc    Login do usuário
 * @route   POST /auth/session
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ========================================
    // 1. VALIDAÇÕES BÁSICAS
    // ========================================
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Email e senha são obrigatórios'
      });
    }

    // ========================================
    // 2. BUSCAR USUÁRIO POR EMAIL (COM SENHA)
    // ========================================
    
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password'); // Incluir senha no select

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // ========================================
    // 3. VERIFICAR STATUS DA CONTA
    // ========================================
    
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Conta inativa',
        message: `Sua conta está ${user.status.toLowerCase()}. Entre em contato com o suporte.`
      });
    }

    // ========================================
    // 4. COMPARAR SENHA
    // ========================================
    
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // ========================================
    // 5. GERAR TOKEN JWT
    // ========================================
    
    const token = generateToken(user._id);

    console.log(`✅ Login realizado: ${user._id} (${user.email})`);

    // ========================================
    // 6. PREPARAR DADOS DO USUÁRIO PARA RETORNAR
    // ========================================
    
    const userResponse = user.toJSON();

    // Formatar resposta conforme tipo de conta
    const userData = {
      id: userResponse._id.toString(),
      name: userResponse.name,
      email: userResponse.email,
      accountType: userResponse.accountType,
      status: userResponse.status,
      emailVerified: userResponse.emailVerified,
      fixTax: userResponse.fixTax,
      percentTax: userResponse.percentTax
    };

    // Adicionar campos específicos conforme tipo
    if (userResponse.accountType === 'PERSON') {
      userData.type = 'PERSON';
      userData.cpf = userResponse.cpf;
    } else if (userResponse.accountType === 'COMPANY') {
      userData.type = 'COMPANY';
      userData.companyName = userResponse.companyName;
      userData.tradeName = userResponse.tradeName;
      userData.cnpj = userResponse.cnpj;
    }

    // ========================================
    // 7. RETORNAR RESPOSTA DE SUCESSO
    // ========================================
    
    // Formato compatível com o frontend
    return res.status(200).json({
      data: {
        session: token,
        user: userData,
        message: 'Login realizado com sucesso!'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    next(error);
  }
};

/**
 * @desc    Buscar prêmios/conquistas do usuário
 * @route   GET /user/me/awards
 * @access  Private
 */
export const getUserAwards = async (req, res, next) => {
  try {
    // Por enquanto, retornar array vazio
    // Em produção, implementar sistema de conquistas/prêmios
    res.status(200).json({
      data: {
        awards: []
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar prêmios:', error);
    next(errorHandler(500, 'Erro interno do servidor', error.message));
  }
};

/**
 * @desc    Buscar dados do usuário logado
 * @route   GET /user/me
 * @access  Private (requer autenticação)
 */
export const getUserMe = async (req, res, next) => {
  try {
    // req.user foi adicionado pelo middleware authenticate
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: 'Usuário não autenticado'
      });
    }

    // Formatar resposta conforme tipo de conta
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      status: user.status,
      emailVerified: user.emailVerified,
      fixTax: user.fixTax,
      percentTax: user.percentTax,
      twoFactorEnabled: user.twoFactorEnabled || false,
      twoFactorMethod: user.twoFactorMethod || null
    };

    // Adicionar campos específicos conforme tipo
    if (user.accountType === 'PERSON') {
      userData.type = 'PERSON';
      userData.cpf = user.cpf;
      userData.birthDate = user.birthDate;
    } else if (user.accountType === 'COMPANY') {
      userData.type = 'COMPANY';
      userData.companyName = user.companyName;
      userData.tradeName = user.tradeName;
      userData.cnpj = user.cnpj;
    }

    return res.status(200).json({
      data: userData
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do usuário:', error);
    next(error);
  }
};

