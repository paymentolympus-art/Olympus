# 🚀 Olympus Pay Backend - Gateway de Pagamentos PIX

Backend para gateway de pagamentos PIX usando **Node.js + Express.js + MongoDB + Mercado Pago**.

## 📋 Pré-requisitos

- **Node.js** 18+ (recomendado usar LTS)
- **MongoDB** 6+ (local ou Atlas)
- **Conta no Mercado Pago** (https://www.mercadopago.com.br/)
  - Acesse: https://www.mercadopago.com.br/developers/panel/credentials
  - Copie seu **Access Token** (Test ou Production)

## 🛠️ Instalação

### 1. Clone o repositório ou crie a pasta do projeto

```bash
mkdir insane-backend
cd insane-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olympus-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
NODE_ENV=development
```

#### Como obter o Access Token do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login na sua conta
3. Copie o **Access Token** (Test ou Production)
4. Cole no `.env` como `MERCADOPAGO_ACCESS_TOKEN`

**⚠️ Importante:**
- Use **TEST** token para desenvolvimento/testes
- Use **PRODUCTION** token apenas em produção
- Não compartilhe seus tokens!

### 4. Inicie o MongoDB

**Opção 1: MongoDB Local**
```bash
# Se tiver MongoDB instalado localmente
mongod
```

**Opção 2: MongoDB Atlas (Cloud)**
1. Crie uma conta em: https://www.mongodb.com/cloud/atlas
2. Crie um cluster gratuito
3. Copie a connection string
4. Cole no `.env` como `MONGODB_URI`

**Opção 3: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Inicie o servidor

**Modo desenvolvimento (com nodemon - auto-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

Você deve ver:
```
✅ MongoDB conectado com sucesso!
   Database: olympus-pay

🚀 Servidor iniciado com sucesso!
   URL: http://localhost:3000
   Ambiente: development
   Health Check: http://localhost:3000/health
```

## 📡 Estrutura do Projeto

```
insane-backend/
├── src/
│   ├── app.js                 # Setup Express e MongoDB
│   ├── models/
│   │   └── Order.js          # Schema Mongoose do Order
│   ├── controllers/
│   │   └── orderController.js # Lógica de negócio (criar pedido)
│   ├── routes/
│   │   └── orderRoutes.js    # Rotas da API
│   └── middlewares/
│       ├── validation.js     # Validação com Joi
│       └── errorHandler.js   # Tratamento de erros
├── .env                       # Variáveis de ambiente (não commitado)
├── .env.example              # Exemplo de variáveis
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testando a API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Criar um Pedido (POST /api/orders)

#### Usando cURL:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.90,
    "description": "Compra de produto X",
    "payerEmail": "cliente@example.com",
    "items": [
      {
        "name": "Produto X",
        "quantity": 1,
        "price": 99.90
      }
    ]
  }'
```

#### Usando Postman:

1. **Método**: `POST`
2. **URL**: `http://localhost:3000/api/orders`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "amount": 99.90,
     "description": "Compra de produto X",
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

#### Response de Sucesso (201):

```json
{
  "data": {
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "PENDING",
    "pixQrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "pixCode": "00020126330014BR.GOV.BCB.PIX...",
    "expiresAt": "2024-01-01T12:30:00.000Z",
    "amount": 99.90,
    "description": "Compra de produto X"
  }
}
```

#### Response de Erro (400):

```json
{
  "error": "Dados inválidos",
  "message": "Por favor, verifique os dados enviados",
  "details": [
    {
      "field": "payerEmail",
      "message": "\"payerEmail\" must be a valid email"
    }
  ]
}
```

## 📊 Exemplos de Requisições

### Exemplo 1: Pedido Simples

```json
{
  "amount": 49.90,
  "payerEmail": "cliente@example.com"
}
```

### Exemplo 2: Pedido com Descrição

```json
{
  "amount": 149.90,
  "description": "Curso de Programação",
  "payerEmail": "aluno@example.com"
}
```

### Exemplo 3: Pedido com Itens

```json
{
  "amount": 299.90,
  "description": "Compra de produtos",
  "payerEmail": "cliente@example.com",
  "items": [
    {
      "name": "Produto A",
      "quantity": 2,
      "price": 99.90
    },
    {
      "name": "Produto B",
      "quantity": 1,
      "price": 100.00
    }
  ]
}
```

### Exemplo 4: Pedido com UserId (checkout autenticado)

```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "payerEmail": "usuario@example.com"
}
```

## 🔍 Verificar Pedidos no MongoDB

Você pode usar o MongoDB Compass ou mongo shell:

```javascript
// Conectar ao MongoDB
use olympus-pay

// Listar todos os pedidos
db.orders.find().pretty()

// Buscar pedido por ID
db.orders.findOne({ _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

// Buscar pedidos pendentes
db.orders.find({ status: "PENDING" })

// Buscar pedidos pagos
db.orders.find({ status: "PAID" })
```

## 🐛 Troubleshooting

### Erro: "MongoDB conectado com sucesso!"

**Problema**: MongoDB não está rodando ou URI incorreta.

**Solução**:
1. Verifique se o MongoDB está rodando: `mongod` ou Docker
2. Verifique a URI no `.env`
3. Teste a conexão manualmente

### Erro: "Erro ao criar pagamento no Mercado Pago"

**Problema**: Access Token inválido ou falta de permissões.

**Solução**:
1. Verifique o token no `.env`
2. Confirme que está usando o token correto (Test ou Production)
3. Verifique se a conta Mercado Pago está ativa

### Erro: "ValidationError" ou "CastError"

**Problema**: Dados inválidos na requisição.

**Solução**:
1. Verifique o formato do JSON
2. Confirme que `amount` é um número positivo
3. Confirme que `payerEmail` é um email válido
4. Verifique os tipos de dados dos `items`

## 📝 Próximas Etapas

Após esta Etapa 1 estar funcionando, vamos implementar:

- ✅ **Etapa 2**: `GET /api/orders/:id/status` - Consultar status do pedido
- ✅ **Etapa 3**: Webhook do Mercado Pago - Receber confirmação de pagamento
- ✅ **Etapa 4**: Integração com frontend React existente

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este é um projeto de desenvolvimento. Para produção:

1. Adicione autenticação JWT
2. Implemente rate limiting
3. Valide origem das requisições (CORS restrito)
4. Use HTTPS
5. Proteja variáveis de ambiente
6. Implemente logging adequado
7. Adicione testes automatizados

## 📚 Documentação

- **Mercado Pago SDK**: https://github.com/mercadopago/sdk-nodejs
- **Mercado Pago API**: https://www.mercadopago.com.br/developers/pt/docs
- **Mongoose**: https://mongoosejs.com/
- **Express**: https://expressjs.com/
- **Joi**: https://joi.dev/

## 🤝 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Logs do console
2. Documentação do Mercado Pago
3. Documentação do Mongoose

---

**Desenvolvido com ❤️ para Olympus Pay**


