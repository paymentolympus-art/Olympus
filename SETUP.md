# ⚙️ Guia de Setup Rápido

## 1. Instalar Dependências

```bash
npm install
```

## 2. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olympus-pay
MERCADOPAGO_ACCESS_TOKEN=SEU_TOKEN_AQUI
MP_WEBHOOK_SECRET=SEU_SECRET_AQUI
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Como obter o MERCADOPAGO_ACCESS_TOKEN:

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login na sua conta Mercado Pago
3. Copie o **Access Token** (Test ou Production)
4. Cole no `.env` substituindo `SEU_TOKEN_AQUI`

⚠️ **Importante**: 
- Use token **TEST** para desenvolvimento
- Use token **PRODUCTION** apenas em produção

### Como obter o MP_WEBHOOK_SECRET:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em "Webhooks" > "Credenciais"
4. Copie o **Secret key** (ou crie um novo)
5. Cole no `.env` como `MP_WEBHOOK_SECRET`

## 3. Iniciar MongoDB

**Opção 1: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opção 2: MongoDB Local**
```bash
# Se tiver MongoDB instalado localmente
mongod
```

**Opção 3: MongoDB Atlas (Cloud)**
1. Crie conta em: https://www.mongodb.com/cloud/atlas
2. Crie cluster gratuito
3. Copie connection string
4. Cole no `.env` como `MONGODB_URI`

## 4. Iniciar Servidor

```bash
npm run dev
```

Ou em produção:
```bash
npm start
```

## 5. Testar

```bash
curl http://localhost:3000/health
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 6. Criar um Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.90,
    "description": "Compra de produto X",
    "payerEmail": "cliente@example.com"
  }'
```

Você deve receber um QR Code PIX! 🎉

