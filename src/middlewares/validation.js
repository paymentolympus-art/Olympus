import Joi from 'joi';

/**
 * Middleware de validação usando Joi
 * 
 * Valida o body da requisição antes de chegar no controller.
 * Se houver erro, retorna 400 Bad Request com os detalhes.
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true // Remove campos não definidos no schema
    });

    if (error) {
      // Formatar erros do Joi para um formato mais amigável
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Por favor, verifique os dados enviados',
        details: errors
      });
    }

    // Substituir req.body pelo valor validado (com campos não definidos removidos)
    req.body = value;
    next();
  };
};

/**
 * Schema de validação para registro de usuário (POST /user/create)
 */
export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),

  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Senhas não coincidem',
      'any.required': 'Confirmação de senha é obrigatória'
    }),

  accountType: Joi.string().valid('PERSON', 'COMPANY').required()
    .messages({
      'any.only': 'Tipo de conta deve ser PERSON ou COMPANY',
      'any.required': 'Tipo de conta é obrigatório'
    }),

  acceptTerms: Joi.boolean().valid(true).required()
    .messages({
      'any.only': 'Você deve aceitar os termos de uso',
      'any.required': 'Aceite de termos é obrigatório'
    }),

  // Campos PF (opcionais, mas obrigatórios se accountType === 'PERSON')
  cpf: Joi.string().when('accountType', {
    is: 'PERSON',
    then: Joi.string().pattern(/^\d{11}$/).required()
      .messages({
        'string.pattern.base': 'CPF deve ter 11 dígitos',
        'any.required': 'CPF é obrigatório para Pessoa Física'
      }),
    otherwise: Joi.optional()
  }),

  birthDate: Joi.string().when('accountType', {
    is: 'PERSON',
    then: Joi.string().required()
      .messages({
        'any.required': 'Data de nascimento é obrigatória para Pessoa Física'
      }),
    otherwise: Joi.optional()
  }),

  // Campos PJ (opcionais, mas obrigatórios se accountType === 'COMPANY')
  cnpj: Joi.string().when('accountType', {
    is: 'COMPANY',
    then: Joi.string().pattern(/^\d{14}$/).required()
      .messages({
        'string.pattern.base': 'CNPJ deve ter 14 dígitos',
        'any.required': 'CNPJ é obrigatório para Pessoa Jurídica'
      }),
    otherwise: Joi.optional()
  }),

  companyName: Joi.string().when('accountType', {
    is: 'COMPANY',
    then: Joi.string().min(3).required()
      .messages({
        'string.min': 'Nome da empresa deve ter pelo menos 3 caracteres',
        'any.required': 'Nome da empresa é obrigatório para Pessoa Jurídica'
      }),
    otherwise: Joi.optional()
  }),

  tradeName: Joi.string().when('accountType', {
    is: 'COMPANY',
    then: Joi.string().min(3).required()
      .messages({
        'string.min': 'Nome fantasia deve ter pelo menos 3 caracteres',
        'any.required': 'Nome fantasia é obrigatório para Pessoa Jurídica'
      }),
    otherwise: Joi.optional()
  }),

  // Campo comum
  phone: Joi.string().pattern(/^\d{11}$/).required()
    .messages({
      'string.pattern.base': 'Telefone deve ter 11 dígitos',
      'any.required': 'Telefone é obrigatório'
    })
});

/**
 * Schema de validação para login (POST /auth/session)
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),

  password: Joi.string().min(1).required()
    .messages({
      'any.required': 'Senha é obrigatória'
    })
});

/**
 * Schema de validação para criação de produto (POST /products)
 */
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('DIGITAL', 'PHYSICAL').default('DIGITAL')
    .messages({
      'any.only': 'Tipo deve ser DIGITAL ou PHYSICAL'
    }),
  paymentFormat: Joi.string().valid('ONE_TIME', 'RECURRING').default('ONE_TIME')
    .messages({
      'any.only': 'Formato de pagamento deve ser ONE_TIME ou RECURRING'
    }),
  price: Joi.string().required()
    .custom((value, helpers) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return helpers.error('number.base');
      }
      return value;
    })
    .messages({
      'any.required': 'Preço é obrigatório',
      'number.base': 'Preço deve ser um número válido maior ou igual a zero'
    })
});

/**
 * Schema de validação para atualização de produto (PUT /products/:id)
 */
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('DIGITAL', 'PHYSICAL').optional()
    .messages({
      'any.only': 'Tipo deve ser DIGITAL ou PHYSICAL'
    }),
  paymentFormat: Joi.string().valid('ONE_TIME', 'RECURRING').optional()
    .messages({
      'any.only': 'Formato de pagamento deve ser ONE_TIME ou RECURRING'
    }),
  price: Joi.string().optional()
    .custom((value, helpers) => {
      if (value === undefined || value === null || value === '') {
        return value; // Permitir undefined para campos opcionais
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return helpers.error('number.base');
      }
      return value;
    })
    .messages({
      'number.base': 'Preço deve ser um número válido maior ou igual a zero'
    }),
  status: Joi.string().valid('ACTIVE', 'DISABLED', 'PENDING', 'REJECTED').optional()
    .messages({
      'any.only': 'Status deve ser ACTIVE, DISABLED, PENDING ou REJECTED'
    }),
  urlBack: Joi.string().allow('').optional(),
  urlRedirect: Joi.string().allow('').optional()
});

/**
 * Schema de validação para criação de pedido (POST /orders)
 */
export const createOrderSchema = Joi.object({
  // userId é opcional (pode ser null para checkout público)
  userId: Joi.string().hex().length(24).allow(null).optional()
    .messages({
      'string.hex': 'ID do usuário deve ser um ObjectId válido',
      'string.length': 'ID do usuário deve ter 24 caracteres'
    }),

  // amount é obrigatório e deve ser um número positivo
  amount: Joi.number().positive().required()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser maior que zero',
      'any.required': 'Valor do pedido é obrigatório'
    }),

  // description é opcional
  description: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Descrição deve ter no máximo 500 caracteres'
    }),

  // payerEmail é obrigatório e deve ser um email válido
  payerEmail: Joi.string().email().required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email do pagador é obrigatório'
    }),

  // items é opcional e deve ser um array
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required()
        .messages({
          'any.required': 'Nome do item é obrigatório'
        }),
      quantity: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Quantidade deve ser um número',
          'number.integer': 'Quantidade deve ser um número inteiro',
          'number.positive': 'Quantidade deve ser maior que zero',
          'any.required': 'Quantidade é obrigatória'
        }),
      price: Joi.number().positive().required()
        .messages({
          'number.base': 'Preço deve ser um número',
          'number.positive': 'Preço deve ser maior que zero',
          'any.required': 'Preço é obrigatório'
        })
    })
  ).optional()
});

