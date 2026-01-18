# 🚀 PRÓXIMO PASSO: DEPLOY NA VERCEL

## ✅ Repositório GitHub Conectado!

Agora que o código está no GitHub, vamos fazer o deploy na Vercel.

---

## 📋 Passo a Passo para Deploy na Vercel

### 1️⃣ Acessar Vercel

1. Acesse: **https://vercel.com/new**
2. Faça login (ou crie conta se ainda não tem)
3. **Recomendado:** Faça login com GitHub para facilitar

---

### 2️⃣ Importar Repositório

1. Na página **"New Project"**, você verá uma lista de repositórios do GitHub
2. Procure por **"Olympus"** (ou `paymentolympus-art/Olympus`)
3. Clique em **"Import"**

---

### 3️⃣ Configurar Projeto

Na tela de configuração do projeto:

#### **Framework Preset:**
- Selecione: **"Other"**

#### **Root Directory:**
- Deixe **vazio** ou coloque `.` (ponto)

#### **Build Command:**
- Deixe **vazio**

#### **Output Directory:**
- Deixe **vazio**

#### **Install Command:**
- Coloque: `npm install`

---

### 4️⃣ Configurar Variáveis de Ambiente

⚠️ **MUITO IMPORTANTE:** Configure ANTES de fazer deploy!

Clique em **"Environment Variables"** (ou **"Add Environment Variable"**) e adicione:

#### **🔴 OBRIGATÓRIAS:**

**1. MongoDB:**
```
Nome: MONGODB_URI
Valor: mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco?retryWrites=true&w=majority
```
*(Use a connection string do seu MongoDB Atlas)*

**2. Mercado Pago:**
```
Nome: MERCADOPAGO_ACCESS_TOKEN
Valor: TEST-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
```
*(Seu token de acesso do Mercado Pago)*

**3. Mercado Pago Webhook:**
```
Nome: MP_WEBHOOK_SECRET
Valor: seu-webhook-secret-aqui
```
*(Secret do webhook do Mercado Pago)*

**4. JWT:**
```
Nome: JWT_SECRET
Valor: sua-chave-secreta-jwt-muito-segura-aqui
```
*(Qualquer string aleatória e segura)*

---

#### **🟡 IMPORTANTES:**

**5. Frontend URL:**
```
Nome: FRONTEND_URL
Valor: https://seu-frontend.vercel.app
```
Ou se o frontend estiver em outro lugar:
```
Valor: https://seu-dominio.com
```
*(Atualize depois com a URL real do seu frontend)*

**6. Backend URL:**
```
Nome: BACKEND_URL
Valor: https://seu-projeto.vercel.app
```
⚠️ **ATUALIZE** este valor depois do primeiro deploy com a URL real que a Vercel gerar!

---

#### **🟢 OPCIONAIS:**

**7. Domínio CNAME:**
```
Nome: DOMAIN_CNAME_VALUE
Valor: checkout.insanepay.com.br
```

---

### 5️⃣ Fazer Deploy

1. Após configurar as variáveis de ambiente, clique em **"Deploy"**
2. Aguarde o build completar (pode demorar 1-2 minutos)
3. A Vercel mostrará o progresso do build
4. Quando terminar, você verá uma URL: `https://olympus-xxxxx.vercel.app`

---

### 6️⃣ Atualizar BACKEND_URL

Após o primeiro deploy:

1. **Copie a URL gerada pela Vercel** (ex: `https://olympus-abc123.vercel.app`)
2. Na Vercel, vá em **Settings** → **Environment Variables**
3. Encontre `BACKEND_URL` e clique em **"Edit"** ou **"..."** → **"Edit"**
4. Atualize com a URL real: `https://olympus-abc123.vercel.app`
5. Clique em **"Save"**
6. A Vercel fará um novo deploy automaticamente

---

### 7️⃣ Testar Deploy

Após o deploy, teste:

#### **Health Check:**
```
https://olympus-xxxxx.vercel.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente"
}
```

#### **API Info:**
```
https://olympus-xxxxx.vercel.app/api
```

---

### 8️⃣ Configurar Webhook do Mercado Pago

Após o deploy funcionar:

1. Acesse: **https://www.mercadopago.com.br/developers**
2. Faça login
3. Vá em **"Suas integrações"** → **"Webhooks"**
4. Clique em **"Adicionar URL"**
5. Cole a URL do seu backend:
   ```
   https://olympus-xxxxx.vercel.app/webhooks/pix/payment
   ```
6. Selecione eventos: **"Pagamentos"**
7. Salve
8. **Copie o Secret Key** gerado
9. Na Vercel, atualize `MP_WEBHOOK_SECRET` com o valor copiado
10. Faça um novo deploy

---

## ✅ Checklist de Deploy

- [ ] Repositório GitHub criado e conectado
- [ ] Push para GitHub realizado
- [ ] Conta Vercel criada/logada
- [ ] Repositório importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] BACKEND_URL atualizado com URL real
- [ ] Health check funcionando
- [ ] Webhook do Mercado Pago configurado

---

## 🆘 Problemas Comuns

### ❌ Erro: "Module not found"
**Solução:** Verifique se `node_modules` está no `.gitignore` e se `package-lock.json` está commitado

### ❌ Erro: "MongoDB connection failed"
**Solução:** 
- Verifique se `MONGODB_URI` está correta na Vercel
- Verifique se o IP `0.0.0.0/0` está liberado no MongoDB Atlas

### ❌ Erro: "CORS error"
**Solução:** Atualize `FRONTEND_URL` na Vercel com a URL correta do frontend

### ❌ Build falhando
**Solução:** 
- Verifique os logs na Vercel (Deployments → [deployment] → Logs)
- Verifique se todas as dependências estão no `package.json`

---

## 📖 Documentação Adicional

- **Guia Completo:** `DEPLOY_VERCEL.md`
- **Aviso Uploads:** `AVISO_UPLOADS_VERCEL.md`
- **Passo a Passo Detalhado:** `PASSO_A_PASSO_DEPLOY.md`

---

**🎉 Boa sorte com o deploy!**

