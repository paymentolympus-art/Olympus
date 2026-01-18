# ⚡ Solução Rápida - Servidor Não Está Rodando

## ❌ Erro: "ERR_CONNECTION_REFUSED" ou Servidor não responde

### 🔍 Diagnóstico Rápido

1. **Verificar se MongoDB está rodando**
   ```bash
   # Testar conexão MongoDB
   mongo --eval "db.version()"
   ```

2. **Verificar porta 3000**
   ```bash
   netstat -ano | findstr :3000
   ```

3. **Verificar processos Node.js**
   ```bash
   tasklist | findstr node.exe
   ```

---

## ✅ Solução Passo a Passo

### 1. Parar Todos os Processos Node.js

**Windows:**
```bash
# Parar todos os processos node
taskkill /F /IM node.exe

# Ou feche todos os terminais que estão rodando Node
```

### 2. Verificar e Configurar MongoDB

**Opção 1: Docker (Recomendado)**
```bash
# Iniciar MongoDB via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verificar se está rodando
docker ps
```

**Opção 2: MongoDB Local**
- Abra "Serviços" do Windows (Win+R > services.msc)
- Procure "MongoDB"
- Clique direito > Iniciar

**Opção 3: MongoDB Atlas (Cloud)**
- Use connection string no `.env`

### 3. Editar .env com Tokens Reais

Edite o arquivo `insane-backend\.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/insane-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-real-aqui
MP_WEBHOOK_SECRET=seu-secret-real-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANTE**: 
- Para testes básicos, pode usar tokens fictícios temporariamente
- Mas para criar pedidos reais, precisa de tokens válidos do Mercado Pago

### 4. Iniciar Servidor Corretamente

**Opção 1: Terminal (Recomendado)**
```bash
cd insane-backend
npm run dev
```

**Opção 2: Script BAT**
- Clique duplo em: `INICIAR_SERVIDOR.bat`

**Opção 3: Modo Produção**
```bash
cd insane-backend
npm start
```

### 5. Verificar se Está Rodando

**No terminal, você deve ver:**
```
✅ MongoDB conectado com sucesso!
   Database: insane-pay

🚀 Servidor iniciado com sucesso!
   URL: http://localhost:3000
   Ambiente: development
   Health Check: http://localhost:3000/health
```

**Teste no navegador:**
- Abra: http://localhost:3000/health
- Deve retornar JSON com status "ok"

**Teste com curl:**
```bash
curl http://localhost:3000/health
```

---

## 🔗 URLs CORRETAS para Testar

### ✅ URLs que Funcionam:

1. **Health Check**: http://localhost:3000/health
2. **API Info**: http://localhost:3000/api

### ❌ URLs ERRADAS:

- ❌ `localhost:3000/Testando/insane-front-main/` 
  - **PROBLEMA**: Não é uma rota válida do backend!
  - **CORREÇÃO**: Use `localhost:3000/health`

- ❌ `localhost:3000/api/orders` (no navegador)
  - **PROBLEMA**: Precisa ser POST, navegador faz GET
  - **CORREÇÃO**: Use Postman ou curl

---

## 🧪 Teste Rápido

### 1. Abra no Navegador:
```
http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Se funcionar, teste criar pedido com Postman:
- **Método**: POST
- **URL**: http://localhost:3000/api/orders
- **Body** (raw JSON):
```json
{
  "amount": 99.90,
  "payerEmail": "teste@example.com",
  "description": "Teste"
}
```

---

## 🐛 Problemas Comuns

### Erro: "MongoDB connection failed"

**Solução:**
1. Verifique se MongoDB está rodando
2. Teste: `mongo --eval "db.version()"`
3. Se não funcionar, inicie MongoDB:
   - Docker: `docker start mongodb`
   - Serviços: Iniciar serviço MongoDB

### Erro: "Port 3000 already in use"

**Solução:**
1. Pare o processo na porta 3000:
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID [PID_NUMBER] /F
   ```
2. Ou mude a porta no `.env`: `PORT=3001`

### Erro: "Cannot find module"

**Solução:**
```bash
cd insane-backend
npm install
```

---

## 📋 Checklist Rápido

- [ ] MongoDB está rodando?
- [ ] Arquivo `.env` existe e está configurado?
- [ ] Dependências instaladas? (`npm install`)
- [ ] Porta 3000 está livre?
- [ ] Servidor iniciou sem erros?
- [ ] Health check funciona? (http://localhost:3000/health)

---

## 🎯 Próximos Passos

Após o servidor rodar:

1. ✅ Teste Health Check: http://localhost:3000/health
2. ✅ Teste API Info: http://localhost:3000/api
3. ✅ Configure tokens do Mercado Pago no `.env`
4. ✅ Teste criar pedido (Postman ou curl)
5. ✅ Teste consultar status

---

**Ainda com problemas? Verifique os logs do terminal para ver o erro específico!**

