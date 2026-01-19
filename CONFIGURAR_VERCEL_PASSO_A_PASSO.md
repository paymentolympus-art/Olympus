# 🚀 CONFIGURAR VERCEL - PASSO A PASSO COMPLETO

## 📋 Este guia vai te ajudar a configurar TUDO na Vercel em 5 minutos!

---

## 🎯 PARTE 1: CONFIGURAR BACKEND

### **Passo 1.1: Acessar Projeto Backend**

1. Acesse: **https://vercel.com/dashboard**
2. Clique no projeto **`olympus-payment`** (ou o nome do seu backend)

### **Passo 1.2: Configurar Variáveis de Ambiente**

1. No menu lateral, clique em **"Settings"**
2. Clique em **"Environment Variables"** (no menu lateral esquerdo)
3. Você verá uma lista de variáveis (pode estar vazia)

### **Passo 1.3: Adicionar Variáveis (Uma por Uma)**

⚠️ **IMPORTANTE:** Adicione TODAS estas variáveis. Clique em **"+ Add New"** para cada uma:

#### **Variável 1: MONGODB_URI**
```
Key: MONGODB_URI
Value: [COLE AQUI SUA CONNECTION STRING DO MONGODB ATLAS]
```
**Onde encontrar:** MongoDB Atlas → Clusters → Connect → Connect your application → Copie a string

**Exemplo:**
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/olympus-pay?retryWrites=true&w=majority
```

#### **Variável 2: MERCADOPAGO_ACCESS_TOKEN**
```
Key: MERCADOPAGO_ACCESS_TOKEN
Value: [COLE AQUI SEU ACCESS TOKEN DO MERCADO PAGO]
```
**Onde encontrar:** Mercado Pago → Suas integrações → Credenciais → Access Token (TEST ou PRODUCTION)

**Exemplo:**
```
TEST-1234567890123456-123456-abcdef1234567890abcdef1234567890-123456789
```

#### **Variável 3: MP_WEBHOOK_SECRET**
```
Key: MP_WEBHOOK_SECRET
Value: [COLE AQUI SEU WEBHOOK SECRET DO MERCADO PAGO]
```
**Onde encontrar:** Mercado Pago → Suas integrações → Webhooks → Secret key

**Exemplo:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

#### **Variável 4: JWT_SECRET**
```
Key: JWT_SECRET
Value: [COLE AQUI UMA CHAVE SECRETA ALEATÓRIA]
```
**Pode ser qualquer string aleatória e segura!**

**Exemplo (gere uma chave aleatória):**
```
olympus-pay-jwt-secret-key-2024-super-secure-random-string-123456789
```

**💡 Dica:** Use um gerador online ou crie uma string longa e aleatória.

#### **Variável 5: FRONTEND_URL**
```
Key: FRONTEND_URL
Value: https://olympus-frontend-swart.vercel.app
```
⚠️ **IMPORTANTE:** Use a URL **real** do seu frontend! Se for diferente, ajuste.

#### **Variável 6: BACKEND_URL**
```
Key: BACKEND_URL
Value: https://olympus-payment.vercel.app
```

#### **Variável 7: DOMAIN_CNAME_VALUE (OPCIONAL)**
```
Key: DOMAIN_CNAME_VALUE
Value: checkout.olympuspay.com.br
```
⚠️ **OPCIONAL:** Só adicione se for usar domínios personalizados.

### **Passo 1.4: Salvar e Aguardar Redeploy**

1. Após adicionar TODAS as variáveis, a Vercel fará um **redeploy automático**
2. Aguarde 2-3 minutos
3. Você verá um novo deploy sendo criado automaticamente

### **Passo 1.5: Verificar se Funcionou**

1. Após o redeploy, acesse no navegador:
   ```
   https://olympus-payment.vercel.app/health
   ```
2. Deve retornar:
   ```json
   {
     "status": "ok",
     "message": "Servidor funcionando corretamente"
   }
   ```
3. ✅ Se retornar isso, o backend está funcionando!

---

## 🎯 PARTE 2: CONFIGURAR FRONTEND

### **Passo 2.1: Acessar Projeto Frontend**

1. Acesse: **https://vercel.com/dashboard**
2. Clique no projeto **`olympus-frontend-swart`** (ou o nome do seu frontend)

### **Passo 2.2: Verificar Variável VITE_URL**

1. No menu lateral, clique em **"Settings"**
2. Clique em **"Environment Variables"**
3. Verifique se existe:

```
Key: VITE_URL
Value: https://olympus-payment.vercel.app
```

✅ **Se já existir e estiver correto, está pronto!**

❌ **Se não existir ou estiver errado:**
   - Clique em **"+ Add New"**
   - Key: `VITE_URL`
   - Value: `https://olympus-payment.vercel.app`
   - Clique em **"Save"**

### **Passo 2.3: Aguardar Redeploy (se necessário)**

- Se você adicionou ou alterou a variável, a Vercel fará redeploy automático
- Aguarde 2-3 minutos

---

## ✅ PARTE 3: TESTAR TUDO

### **Teste 1: Backend Health Check**

Acesse no navegador:
```
https://olympus-payment.vercel.app/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente"
}
```

### **Teste 2: Frontend**

1. Acesse: `https://olympus-frontend-swart.vercel.app`
2. Tente fazer login
3. Se funcionar, está tudo OK! ✅

### **Teste 3: Verificar Erros no Console**

Se ainda houver erro:

1. Abra o navegador
2. Pressione **F12** (DevTools)
3. Vá na aba **Console**
4. Tente fazer login
5. Veja qual erro aparece

**Erros comuns:**
- `CORS policy`: Backend não tem `FRONTEND_URL` configurada
- `404 Not Found`: Backend não está respondendo
- `401 Unauthorized`: Credenciais incorretas ou backend sem `JWT_SECRET`
- `500 Internal Server Error`: Backend sem `MONGODB_URI` ou outras variáveis

---

## 📋 CHECKLIST FINAL

### Backend:
- [ ] `MONGODB_URI` configurada
- [ ] `MERCADOPAGO_ACCESS_TOKEN` configurada
- [ ] `MP_WEBHOOK_SECRET` configurada
- [ ] `JWT_SECRET` configurada
- [ ] `FRONTEND_URL` = `https://olympus-frontend-swart.vercel.app`
- [ ] `BACKEND_URL` = `https://olympus-payment.vercel.app`
- [ ] Health check funcionando (`/health`)

### Frontend:
- [ ] `VITE_URL` = `https://olympus-payment.vercel.app`
- [ ] Frontend acessível
- [ ] Login funcionando

---

## 🆘 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verifique os logs:**
   - Vercel → Projeto → Deployments → Clique no último deploy → "Runtime Logs"

2. **Verifique o console do navegador:**
   - F12 → Console → Veja os erros

3. **Teste o backend diretamente:**
   - `https://olympus-payment.vercel.app/health`
   - `https://olympus-payment.vercel.app/api`

---

## 🎉 PRONTO!

Após seguir todos os passos, seu gateway estará funcionando em produção!

---

## 📝 RESUMO RÁPIDO

1. **Backend:** Adicione 6-7 variáveis de ambiente
2. **Frontend:** Verifique se `VITE_URL` está configurada
3. **Teste:** Acesse `/health` e tente fazer login
4. **Pronto!** 🎉


