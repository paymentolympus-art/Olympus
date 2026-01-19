# 🚀 PASSO A PASSO COMPLETO - DEPLOY NA VERCEL

## 📋 Passo 1: Preparar Repositório Git

### Opção A: Usar o Script PowerShell (Mais Fácil)

```powershell
# Execute dentro da pasta insane-backend
.\PREPARAR_DEPLOY.ps1
```

### Opção B: Manualmente

```bash
cd insane-backend

# Inicializar Git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Preparando para deploy na Vercel"
```

---

## 📋 Passo 2: Criar Repositório no GitHub

### 2.1 Acessar GitHub

1. Acesse: **https://github.com/new**
2. Faça login na sua conta

### 2.2 Criar Novo Repositório

- **Repository name:** `insane-backend` (ou outro nome de sua escolha)
- **Description:** `Backend do gateway de pagamentos PIX`
- **Visibility:** Escolha **Public** ou **Private**
- ⚠️ **NÃO marque** "Add a README file" (já temos arquivos)
- ⚠️ **NÃO adicione** .gitignore ou license (já temos)

### 2.3 Clique em **"Create repository"**

---

## 📋 Passo 3: Conectar Repositório Local ao GitHub

### 3.1 Copiar URL do Repositório

Após criar o repositório, o GitHub mostrará comandos. Use a **HTTPS URL**:
```
https://github.com/SEU-USUARIO/insane-backend.git
```

### 3.2 Executar Comandos no Terminal

```bash
cd C:\Users\umdoi\Downloads\Testando\insane-backend

# Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/insane-backend.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

**Nota:** Se pedir credenciais, use um **Personal Access Token** do GitHub (não a senha).

---

## 📋 Passo 4: Criar Conta na Vercel (Se Ainda Não Tem)

1. Acesse: **https://vercel.com/signup**
2. Clique em **"Continue with GitHub"** (recomendado)
3. Autorize a Vercel a acessar seu GitHub

---

## 📋 Passo 5: Fazer Deploy na Vercel

### 5.1 Importar Projeto

1. Acesse: **https://vercel.com/new**
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `insane-backend` que você acabou de criar
4. Clique em **"Import"**

### 5.2 Configurar Projeto

Na tela de configuração:

- **Framework Preset:** Selecione **"Other"**
- **Root Directory:** Deixe **vazio** (ou `.` se aparecer)
- **Build Command:** Deixe **vazio** (ou `npm install`)
- **Output Directory:** Deixe **vazio**
- **Install Command:** `npm install`

### 5.3 Configurar Variáveis de Ambiente

⚠️ **IMPORTANTE:** Configure ANTES de fazer deploy!

Clique em **"Environment Variables"** e adicione:

#### **MongoDB:**
```
Nome: MONGODB_URI
Valor: mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco?retryWrites=true&w=majority
```

#### **Mercado Pago:**
```
Nome: MERCADOPAGO_ACCESS_TOKEN
Valor: TEST-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
```

```
Nome: MP_WEBHOOK_SECRET
Valor: seu-webhook-secret-aqui
```

#### **JWT:**
```
Nome: JWT_SECRET
Valor: sua-chave-secreta-jwt-muito-segura-aqui
```

#### **CORS:**
```
Nome: FRONTEND_URL
Valor: https://seu-frontend.vercel.app
```
Ou se o frontend estiver em outro lugar:
```
Valor: https://seu-dominio.com
```

#### **Backend URL:**
```
Nome: BACKEND_URL
Valor: https://seu-backend.vercel.app
```
⚠️ **ATUALIZE** este valor depois do primeiro deploy com a URL real gerada!

#### **Domínio CNAME (Opcional):**
```
Nome: DOMAIN_CNAME_VALUE
Valor: checkout.olympuspay.com.br
```

### 5.4 Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (pode demorar 1-2 minutos)
3. Quando terminar, você verá uma URL: `https://seu-projeto.vercel.app`

---

## 📋 Passo 6: Atualizar BACKEND_URL

Após o primeiro deploy:

1. Copie a URL gerada pela Vercel (ex: `https://insane-backend.vercel.app`)
2. Vá em **Settings** → **Environment Variables**
3. Encontre `BACKEND_URL` e **edite**
4. Atualize com a URL real: `https://insane-backend.vercel.app`
5. Salve e faça um novo deploy (a Vercel faz automaticamente)

---

## 📋 Passo 7: Testar Deploy

### 7.1 Testar Health Check

Acesse no navegador:
```
https://seu-projeto.vercel.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Servidor funcionando corretamente"
}
```

### 7.2 Testar API

```
https://seu-projeto.vercel.app/api
```

Deve retornar informações sobre a API.

---

## 📋 Passo 8: Configurar Webhook do Mercado Pago

### 8.1 Acessar Dashboard do Mercado Pago

1. Acesse: **https://www.mercadopago.com.br/developers**
2. Faça login
3. Vá em **"Suas integrações"** → **"Webhooks"**

### 8.2 Adicionar URL de Webhook

1. Clique em **"Adicionar URL"**
2. Cole a URL do seu backend:
   ```
   https://seu-projeto.vercel.app/webhooks/pix/payment
   ```
3. Selecione eventos: **"Pagamentos"**
4. Salve

### 8.3 Copiar Webhook Secret

1. Após criar o webhook, copie o **Secret Key**
2. Vá na Vercel → **Settings** → **Environment Variables**
3. Atualize `MP_WEBHOOK_SECRET` com o valor copiado
4. Faça um novo deploy

---

## ⚠️ IMPORTANTE: Uploads na Vercel

A Vercel **não persiste arquivos**. Para uploads funcionarem:

1. **Leia:** `AVISO_UPLOADS_VERCEL.md`
2. **Opção:** Desabilite uploads temporariamente para testes
3. **Solução:** Implemente Vercel Blob Storage ou Cloudinary (veja o guia)

---

## ✅ Checklist Final

- [ ] Repositório Git criado e commitado
- [ ] Repositório GitHub criado e conectado
- [ ] Deploy na Vercel realizado
- [ ] Variáveis de ambiente configuradas
- [ ] BACKEND_URL atualizado com URL real
- [ ] Health check funcionando
- [ ] Webhook do Mercado Pago configurado
- [ ] Frontend atualizado para usar URL da Vercel

---

## 🆘 Problemas Comuns

### ❌ Erro: "Module not found"
- **Solução:** Verifique se `node_modules` está no `.gitignore` e se o `package-lock.json` está commitado

### ❌ Erro: "Cannot find module"
- **Solução:** Verifique se todos os imports estão corretos e se os arquivos existem

### ❌ Erro: "MongoDB connection failed"
- **Solução:** 
  - Verifique se `MONGODB_URI` está correta
  - Verifique se o IP `0.0.0.0/0` está liberado no MongoDB Atlas

### ❌ Erro: "CORS error"
- **Solução:** Atualize `FRONTEND_URL` na Vercel com a URL correta do frontend

---

## 📞 Suporte

- **Logs do Deploy:** Vercel → Project → Deployments → [deployment] → Logs
- **Environment Variables:** Vercel → Project → Settings → Environment Variables
- **Documentação:** `DEPLOY_VERCEL.md`

---

**🎉 Boa sorte com o deploy!**


