# 🧪 Guia de Testes Local - Insane Pay Backend

## ✅ Pré-requisitos

- ✅ Node.js instalado (v24.11.1 detectado)
- ✅ npm instalado (v11.6.2 detectado)
- ✅ Dependências instaladas (npm install executado)
- ⚠️ MongoDB precisa estar rodando
- ⚠️ Tokens do Mercado Pago precisam estar configurados

---

## 🚀 Passo a Passo para Rodar

### 1. Configurar Variáveis de Ambiente

O arquivo `.env` foi criado automaticamente. Edite com seus dados reais:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olympus-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-real-aqui
MP_WEBHOOK_SECRET=seu-secret-real-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Como obter tokens:**
- **MERCADOPAGO_ACCESS_TOKEN**: https://www.mercadopago.com.br/developers/panel/credentials
- **MP_WEBHOOK_SECRET**: https://www.mercadopago.com.br/developers/panel/app > Webhooks > Credenciais

### 2. Iniciar MongoDB

**Opção 1: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opção 2: MongoDB Local**
Se tiver MongoDB instalado, inicie o serviço:
```bash
# Windows Services ou
mongod
```

**Opção 3: MongoDB Atlas (Cloud)**
- Crie conta: https://www.mongodb.com/cloud/atlas
- Crie cluster gratuito
- Copie connection string
- Cole no `.env` como `MONGODB_URI`

### 3. Iniciar o Servidor

**Opção 1: Usar Script BAT (Windows)**
```bash
# Clique duplo em:
INICIAR_SERVIDOR.bat
```

**Opção 2: Via Terminal**
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

### 4. Verificar se Está Rodando

Abra no navegador: http://localhost:3000/health

Ou use curl:
```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🧪 Testar Endpoints

### 1. Health Check ✅

**GET** http://localhost:3000/health

```bash
curl http://localhost:3000/health
```

**Resposta:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Info da API ✅

**GET** http://localhost:3000/api

```bash
curl http://localhost:3000/api
```

---

### 3. Criar Pedido (POST /api/orders) ✅

**POST** http://localhost:3000/api/orders

**Body:**
```json
{
  "amount": 99.90,
  "description": "Teste de pedido",
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

**Teste com curl:**
```bash
curl -X POST http://localhost:3000/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\": 99.90, \"description\": \"Teste\", \"payerEmail\": \"teste@example.com\"}"
```

**Resposta (201):**
```json
{
  "data": {
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "PENDING",
    "pixQrCode": "data:image/png;base64,iVBORw0KG...",
    "pixCode": "00020126330014BR.GOV.BCB.PIX...",
    "expiresAt": "2024-01-01T12:30:00.000Z",
    "amount": 99.90,
    "description": "Teste de pedido"
  }
}
```

**⚠️ IMPORTANTE**: Copie o `orderId` para usar nos próximos testes!

---

### 4. Consultar Status (GET /api/orders/:id/status) ✅

**GET** http://localhost:3000/api/orders/{orderId}/status

**Substitua `{orderId}` pelo ID copiado anteriormente:**
```bash
curl http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1/status
```

**Resposta (PENDING):**
```json
{
  "status": "PENDING",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "message": "Pagamento pendente"
}
```

**Resposta (PAID):**
```json
{
  "status": "PAID",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:30:00.000Z",
  "message": "Pagamento aprovado!"
}
```

---

### 5. Webhook (POST /webhooks/pix/payment) ✅

Este endpoint é chamado pelo Mercado Pago automaticamente.

**Para testar manualmente:**
```bash
curl -X POST http://localhost:3000/webhooks/pix/payment ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": 123, \"type\": \"payment\", \"action\": \"payment.updated\", \"data\": {\"id\": \"123456789\"}}"
```

**⚠️ Nota**: A assinatura será inválida (é apenas exemplo). Para teste real, use a ferramenta "Testar webhook" no dashboard do Mercado Pago.

---

## 📊 Verificar no MongoDB

### Conectar ao MongoDB

```bash
# MongoDB Shell
mongo

# Ou MongoDB Compass
# Baixe: https://www.mongodb.com/products/compass
```

### Verificar Orders

```javascript
use olympus-pay

// Listar todos os pedidos
db.orders.find().pretty()

// Buscar pedido específico
db.orders.findOne({ _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

// Pedidos pendentes
db.orders.find({ status: "PENDING" })

// Pedidos pagos
db.orders.find({ status: "PAID" })
```

### Verificar Sales

```javascript
// Listar todas as vendas
db.sales.find().pretty()

// Vendas por usuário
db.sales.find({ userId: ObjectId("...") })
```

---

## 🧪 Testar Fluxo Completo

### 1. Criar Pedido
```bash
curl -X POST http://localhost:3000/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\": 99.90, \"payerEmail\": \"teste@example.com\"}"
```

### 2. Copiar orderId da Resposta

### 3. Consultar Status (Polling Simulado)
```bash
# Execute múltiplas vezes para simular polling
curl http://localhost:3000/api/orders/{orderId}/status
```

### 4. Pagar no Mercado Pago Sandbox
- Use o `pixCode` retornado
- Pague no sandbox do MP
- O webhook será enviado automaticamente

### 5. Verificar Status Novamente
```bash
curl http://localhost:3000/api/orders/{orderId}/status
# Deve retornar "status": "PAID"
```

---

## 🐛 Troubleshooting

### Erro: "MongoDB connection failed"

**Problema**: MongoDB não está rodando.

**Solução**:
1. Verifique se MongoDB está rodando
2. Verifique `MONGODB_URI` no `.env`
3. Para Docker: `docker ps` (verificar se container está rodando)

### Erro: "Cannot find module"

**Problema**: Dependências não instaladas.

**Solução**:
```bash
npm install
```

### Erro: "Port 3000 already in use"

**Problema**: Porta 3000 já está em uso.

**Solução**:
1. Mude a porta no `.env`: `PORT=3001`
2. Ou pare o processo usando a porta 3000

### Erro: "Erro ao criar pagamento no Mercado Pago"

**Problema**: Token inválido ou não configurado.

**Solução**:
1. Verifique `MERCADOPAGO_ACCESS_TOKEN` no `.env`
2. Confirme que é um token válido (TEST ou PRODUCTION)
3. Obtenha novo token em: https://www.mercadopago.com.br/developers/panel/credentials

### Webhook não está sendo recebido

**Problema**: URL não acessível ou incorreta.

**Solução**:
1. Para desenvolvimento local, use **ngrok**:
   ```bash
   ngrok http 3000
   ```
2. Copie a URL HTTPS do ngrok
3. Configure no dashboard do MP como URL do webhook

---

## 📝 Logs do Servidor

Ao rodar o servidor, você verá logs como:

```
✅ MongoDB conectado com sucesso!
   Database: olympus-pay

🚀 Servidor iniciado com sucesso!
   URL: http://localhost:3000
   Ambiente: development
   Health Check: http://localhost:3000/health

📦 Order criado: 65a1b2c3d4e5f6g7h8i9j0k1
💳 Criando pagamento no Mercado Pago...
✅ Pagamento PIX criado no Mercado Pago: 123456789
💾 Order atualizado com dados do PIX: 65a1b2c3d4e5f6g7h8i9j0k1
```

---

## 🎯 Próximos Passos

Após testar localmente:

1. ✅ Configurar tokens reais do Mercado Pago
2. ✅ Testar criação de pedidos
3. ✅ Testar consulta de status
4. ✅ Configurar webhook (usar ngrok para local)
5. ✅ Testar fluxo completo de pagamento

---

**Projeto pronto para testes locais! 🚀**


