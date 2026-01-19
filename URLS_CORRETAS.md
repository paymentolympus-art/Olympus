# 🔗 URLs Corretas para Testar o Backend

## ⚠️ IMPORTANTE: URLs Válidas

O backend Node.js **NÃO** serve arquivos estáticos do sistema de arquivos!

❌ **ERRADO**: `localhost:3000/Testando/insane-front-main/`  
✅ **CORRETO**: Veja as URLs abaixo

---

## 🌐 URLs do Backend (Porta 3000)

### 1. Health Check ✅
**URL**: http://localhost:3000/health

Teste se o servidor está rodando:
```
GET http://localhost:3000/health
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

### 2. Info da API ✅
**URL**: http://localhost:3000/api

Veja informações da API:
```
GET http://localhost:3000/api
```

---

### 3. Criar Pedido ✅
**URL**: http://localhost:3000/api/orders

**Método**: POST

**Body**:
```json
{
  "amount": 99.90,
  "description": "Teste",
  "payerEmail": "teste@example.com"
}
```

**Teste no navegador**: ❌ Não funciona (precisa POST)  
**Teste com Postman**: ✅  
**Teste com curl**: ✅
```bash
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d "{\"amount\": 99.90, \"payerEmail\": \"teste@example.com\"}"
```

---

### 4. Consultar Status ✅
**URL**: http://localhost:3000/api/orders/{orderId}/status

**Substitua `{orderId}` pelo ID do pedido:**
```
GET http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1/status
```

---

### 5. Webhook ✅
**URL**: http://localhost:3000/webhooks/pix/payment

**Método**: POST (chamado pelo Mercado Pago)

---

## 🧪 Como Testar no Navegador

### ✅ URLs que funcionam no navegador:

1. **Health Check**: http://localhost:3000/health
2. **API Info**: http://localhost:3000/api

### ❌ URLs que NÃO funcionam no navegador:

- `localhost:3000/api/orders` (precisa POST, não GET)
- `localhost:3000/Testando/insane-front-main/` (não é uma rota válida)

---

## 🔧 Testar com Ferramentas

### 1. Postman (Recomendado)
1. Baixe: https://www.postman.com/downloads/
2. Crie nova requisição
3. Método: POST
4. URL: http://localhost:3000/api/orders
5. Body > raw > JSON
6. Cole o JSON do pedido

### 2. cURL (Terminal)
```bash
# Health Check
curl http://localhost:3000/health

# Criar Pedido
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d "{\"amount\": 99.90, \"payerEmail\": \"teste@example.com\"}"
```

### 3. Thunder Client (VS Code)
1. Instale extensão Thunder Client no VS Code
2. Crie requisições GET/POST
3. Teste todas as URLs

---

## 🚨 Se Erro "ERR_CONNECTION_REFUSED"

### Problema: Servidor não está rodando

**Solução 1: Iniciar servidor**
```bash
cd insane-backend
npm run dev
```

**Solução 2: Verificar se porta está em uso**
```bash
# Ver processos na porta 3000
netstat -ano | findstr :3000

# Se houver processo, pare-o ou mude a porta no .env
```

**Solução 3: Verificar MongoDB**
- MongoDB precisa estar rodando
- Verifique `MONGODB_URI` no `.env`

---

## 📝 Resumo das URLs Válidas

| Rota | Método | URL | Descrição |
|------|--------|-----|-----------|
| Health | GET | http://localhost:3000/health | Verificar se está rodando |
| API Info | GET | http://localhost:3000/api | Info da API |
| Criar Pedido | POST | http://localhost:3000/api/orders | Criar pedido e gerar PIX |
| Consultar Status | GET | http://localhost:3000/api/orders/:id/status | Status do pedido |
| Webhook | POST | http://localhost:3000/webhooks/pix/payment | Receber webhook do MP |

---

**⚠️ Lembre-se**: Backend Node.js serve apenas APIs REST, não arquivos HTML estáticos!


