# ⚙️ Atualizar .env para Autenticação

## 📋 Adicionar ao arquivo `.env`

Abra o arquivo `insane-backend/.env` e adicione estas linhas:

```env
# JWT Secret (para tokens de autenticação)
JWT_SECRET=sua-chave-secreta-jwt-aqui-altere-em-producao
JWT_EXPIRES_IN=7d
```

## 🔑 Gerar JWT_SECRET Seguro

Execute no terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Cole o resultado como `JWT_SECRET` no `.env`.

## 📝 Arquivo .env Completo

Seu arquivo `.env` deve ter:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/olympus-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
MP_WEBHOOK_SECRET=seu-secret-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT (Autenticação)
JWT_SECRET=sua-chave-secreta-jwt-aqui-altere-em-producao
JWT_EXPIRES_IN=7d
```

---

**⚠️ IMPORTANTE**: Reinicie o servidor após alterar o `.env`!


