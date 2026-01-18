# ✅ ETAPA 1 COMPLETA - POST /orders

## 📦 O que foi criado

### Estrutura do Projeto

```
insane-backend/
├── src/
│   ├── app.js                      ✅ Setup Express + MongoDB
│   ├── models/
│   │   └── Order.js               ✅ Schema Mongoose completo
│   ├── controllers/
│   │   └── orderController.js     ✅ Lógica de criação de pedido + PIX
│   ├── routes/
│   │   └── orderRoutes.js         ✅ Rota POST /api/orders
│   └── middlewares/
│       ├── validation.js          ✅ Validação com Joi
│       └── errorHandler.js        ✅ Tratamento de erros global
├── package.json                    ✅ Dependências configuradas
├── .gitignore                      ✅ Arquivos ignorados
├── SETUP.md                        ✅ Guia rápido de setup
├── README.md                       ✅ Documentação completa
└── ETAPA1_COMPLETA.md             ✅ Este arquivo
```

### Arquivos Principais

1. **`src/app.js`**
   - Setup do Express
   - Conexão com MongoDB
   - Configuração de CORS
   - Middlewares globais
   - Tratamento de erros

2. **`src/models/Order.js`**
   - Schema Mongoose completo
   - Campos: userId, amount, description, payerEmail, items, status, pix
   - Índices para performance
   - Métodos úteis (findByStatus, markAsPaid)

3. **`src/controllers/orderController.js`**
   - Função `createOrder`
   - Integração com Mercado Pago SDK
   - Geração de QR Code PIX
   - Salvar no MongoDB
   - Tratamento de erros

4. **`src/routes/orderRoutes.js`**
   - Rota POST `/api/orders`
   - Middleware de validação

5. **`src/middlewares/validation.js`**
   - Validação com Joi
   - Schema para criação de pedido

6. **`src/middlewares/errorHandler.js`**
   - Tratamento centralizado de erros
   - Respostas padronizadas

## 🚀 Como usar

### 1. Instalar dependências

```bash
cd insane-backend
npm install
```

### 2. Configurar .env

Crie um arquivo `.env` na raiz:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/insane-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar MongoDB

```bash
# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou MongoDB local
mongod
```

### 4. Iniciar servidor

```bash
npm run dev
```

### 5. Testar

```bash
# Health check
curl http://localhost:3000/health

# Criar pedido
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.90,
    "description": "Compra de produto X",
    "payerEmail": "cliente@example.com"
  }'
```

## 📋 Rota Implementada

### POST /api/orders

**Body esperado:**
```json
{
  "userId": "string (opcional, ObjectId)",
  "amount": 99.90,
  "description": "string (opcional)",
  "payerEmail": "cliente@example.com",
  "items": [
    {
      "name": "Produto X",
      "quantity": 1,
      "price": 99.90
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "PENDING",
    "pixQrCode": "data:image/png;base64,iVBORw0KG...",
    "pixCode": "00020126330014BR.GOV.BCB.PIX...",
    "expiresAt": "2024-01-01T12:30:00.000Z",
    "amount": 99.90,
    "description": "Compra de produto X"
  }
}
```

## ✅ Funcionalidades Implementadas

- ✅ Validação de dados com Joi
- ✅ Criação de Order no MongoDB
- ✅ Integração com Mercado Pago SDK
- ✅ Geração de QR Code PIX (base64)
- ✅ Geração de código PIX (copia e cola)
- ✅ Expiração de 30 minutos
- ✅ Tratamento de erros completo
- ✅ Logs informativos
- ✅ CORS configurado para frontend

## 🔄 Fluxo Completo

```
1. Cliente envia POST /api/orders
   ↓
2. Middleware valida dados (Joi)
   ↓
3. Controller cria Order no MongoDB (status: PENDING)
   ↓
4. Integra com Mercado Pago SDK
   ↓
5. Mercado Pago retorna QR Code e código PIX
   ↓
6. Salva dados do PIX no Order
   ↓
7. Retorna resposta com QR Code para cliente
```

## 🎯 Próximos Passos

Agora que a Etapa 1 está completa, podemos implementar:

### Etapa 2: GET /orders/:id/status
- Consultar status do pedido no banco
- Opcionalmente consultar no Mercado Pago
- Usar para polling no frontend

### Etapa 3: Webhook do Mercado Pago
- Receber confirmação de pagamento
- Atualizar Order para PAID
- Criar Sale
- Executar integrações

### Etapa 4: Integração com Frontend
- Conectar frontend React existente
- Substituir valores mockados por API real
- Implementar polling de status

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "MongoDB connection failed"
- Verifique se MongoDB está rodando
- Verifique MONGODB_URI no .env

### Erro: "MerchantPago Error"
- Verifique MERCADOPAGO_ACCESS_TOKEN no .env
- Confirme que o token é válido
- Use token TEST para desenvolvimento

### Erro: "Validation Error"
- Verifique formato do JSON
- Confirme que `amount` é número positivo
- Confirme que `payerEmail` é email válido

## 📚 Documentação

- **README.md**: Documentação completa
- **SETUP.md**: Guia rápido de setup
- Código comentado em todos os arquivos

## ✅ Checklist de Teste

- [ ] Servidor inicia sem erros
- [ ] MongoDB conecta com sucesso
- [ ] Health check retorna 200
- [ ] POST /api/orders cria pedido
- [ ] QR Code PIX é retornado
- [ ] Código PIX é retornado
- [ ] Order é salvo no MongoDB
- [ ] Erros são tratados corretamente
- [ ] Validação funciona (testar com dados inválidos)

---

**Etapa 1 concluída com sucesso! 🎉**

Pronto para continuar com a Etapa 2? Pergunte quando estiver pronto!

