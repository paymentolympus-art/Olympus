# 🚀 Guia Rápido: Rodar o Projeto Localmente

## ⚡ Início Rápido (3 minutos)

### 1. Instalar Dependências (primeira vez)

```bash
cd insane-backend
npm install
```

### 2. Criar Arquivo .env

Crie um arquivo `.env` na pasta `insane-backend` com:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olympus-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
MP_WEBHOOK_SECRET=seu-secret-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar MongoDB (se ainda não estiver rodando)

**Opção 1: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opção 2: MongoDB Local**
```bash
# Se tiver MongoDB instalado
mongod
```

**Opção 3: MongoDB Atlas (Cloud)**
- Use connection string do MongoDB Atlas no `.env`

### 4. Iniciar o Servidor

```bash
npm run dev
```

Ou para produção:
```bash
npm start
```

### 5. Testar

Abra o navegador em: http://localhost:3000/health

Ou use curl:
```bash
curl http://localhost:3000/health
```

---

## 📋 URLs Importantes

- **Health Check**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api
- **Criar Pedido**: POST http://localhost:3000/api/orders
- **Consultar Status**: GET http://localhost:3000/api/orders/:id/status
- **Webhook**: POST http://localhost:3000/webhooks/pix/payment

---

## 🧪 Testar Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Criar Pedido
```bash
curl -X POST http://localhost:3000/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\": 99.90, \"payerEmail\": \"teste@example.com\", \"description\": \"Teste\"}"
```

### 3. Consultar Status
```bash
curl http://localhost:3000/api/orders/ORDER_ID_AQUI/status
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "MongoDB connection failed"
- Verifique se MongoDB está rodando
- Verifique MONGODB_URI no `.env`

### Erro: "Port 3000 already in use"
- Mude a porta no `.env`: `PORT=3001`

---

## 📚 Documentação Completa

Veja os arquivos:
- `README.md` - Documentação completa
- `SETUP.md` - Guia de setup
- `ETAPA1_COMPLETA.md` - POST /orders
- `ETAPA2_COMPLETA.md` - GET /orders/:id/status
- `ETAPA3_COMPLETA.md` - Webhooks


