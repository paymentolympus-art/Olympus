/**
 * Middleware de tratamento de erros global
 * 
 * Captura todos os erros não tratados nas rotas e retorna
 * uma resposta JSON padronizada.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      error: 'Erro de validação',
      message: 'Dados inválidos no banco de dados',
      details: errors
    });
  }

  // Erro de cast do Mongoose (ex: ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: `Formato de ID inválido: ${err.value}`
    });
  }

  // Erro do Mercado Pago
  if (err.name === 'MercadoPagoError' || err.response) {
    const mpError = err.response?.data || err;
    return res.status(err.status || 400).json({
      error: 'Erro no Mercado Pago',
      message: mpError.message || 'Erro ao processar pagamento',
      details: mpError.cause || mpError
    });
  }

  // Erro de conexão com MongoDB
  if (err.name === 'MongoServerError') {
    return res.status(500).json({
      error: 'Erro no banco de dados',
      message: 'Erro ao acessar o banco de dados. Tente novamente.'
    });
  }

  // Erro padrão (500)
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  // Em desenvolvimento, retornar stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: 'Erro interno',
      message: message,
      stack: err.stack
    });
  }

  // Em produção, não expor detalhes
  return res.status(statusCode).json({
    error: 'Erro interno',
    message: message
  });
};



