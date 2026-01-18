# 🚀 Guia de Deploy na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel** - Crie em [vercel.com](https://vercel.com)
2. **Conta no MongoDB Atlas** - Já configurado ✅
3. **Token do Mercado Pago** - Já configurado ✅
4. **GitHub/GitLab/Bitbucket** - Para conectar o repositório

---

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Adicionar arquivos ao Git (se ainda não foram)

```bash
cd insane-backend
git init
git add .
git commit -m "Preparando para deploy na Vercel"
```

### 1.2 Criar repositório no GitHub/GitLab/Bitbucket

- Crie um novo repositório
- Faça push do código:
```bash
git remote add origin https://github.com/seu-usuario/insane-backend.git
git branch -M main
git push -u origin main
```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente na Vercel

### 2.1 Acessar Dashboard da Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New"** → **"Project"**
3. Importe seu repositório

### 2.2 Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

#### **MongoDB:**
```
MONGODB_URI = mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco?retryWrites=true&w=majority
```

#### **Mercado Pago:**
```
MERCADOPAGO_ACCESS_TOKEN = TEST-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET = seu-webhook-secret-aqui
```

#### **JWT:**
```
JWT_SECRET = sua-chave-secreta-jwt-muito-segura-aqui
```

#### **CORS - Frontend:**
```
FRONTEND_URL = https://seu-frontend.vercel.app
```
Ou se o frontend estiver em outro lugar:
```
FRONTEND_URL = https://seu-dominio.com
```

#### **Backend URL:**
```
BACKEND_URL = https://seu-backend.vercel.app
```
⚠️ **IMPORTANTE:** Atualize depois do primeiro deploy com a URL real!

#### **Domínio CNAME (opcional):**
```
DOMAIN_CNAME_VALUE = checkout.insanepay.com.br
```

---

## 🚀 Passo 3: Fazer Deploy

### 3.1 Configurações do Projeto

Na Vercel, configure:

- **Framework Preset:** Other
- **Root Directory:** `insane-backend` (ou deixe vazio se estiver na raiz)
- **Build Command:** (deixe vazio ou `npm install`)
- **Output Directory:** (deixe vazio)
- **Install Command:** `npm install`

### 3.2 Deploy Automático

Após conectar o repositório e configurar as variáveis:

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. A Vercel gerará uma URL: `https://seu-projeto.vercel.app`

### 3.3 Atualizar BACKEND_URL

Após o primeiro deploy, copie a URL gerada e:

1. Vá em **Settings** → **Environment Variables**
2. Atualize `BACKEND_URL` com a URL real: `https://seu-projeto.vercel.app`
3. Faça um novo deploy (a Vercel faz automaticamente ao salvar)

---

## 🔄 Passo 4: Configurar Webhooks do Mercado Pago

### 4.1 Acessar Dashboard do Mercado Pago

1. Acesse [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Vá em **"Suas integrações"** → **"Webhooks"**
3. Adicione nova URL de webhook:
   ```
   https://seu-projeto.vercel.app/webhooks/pix/payment
   ```
4. Copie o **Webhook Secret** e atualize `MP_WEBHOOK_SECRET` na Vercel

---

## 📁 Estrutura de Arquivos Necessários

Certifique-se de que os seguintes arquivos existem:

```
insane-backend/
├── api/
│   └── index.js          ✅ Criado
├── src/
│   └── app.js            ✅ Existe
├── package.json          ✅ Existe
├── vercel.json           ✅ Criado
└── .env.example          ✅ Criado
```

---

## 🔍 Passo 5: Verificar o Deploy

### 5.1 Testar Endpoint de Health

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

### 5.2 Testar API

```
https://seu-projeto.vercel.app/api
```

---

## ⚠️ Problemas Comuns e Soluções

### ❌ Erro: "Module not found"

**Solução:** Verifique se todas as dependências estão no `package.json` e se o `package-lock.json` está commitado.

### ❌ Erro: "Cannot find module '../src/app.js'"

**Solução:** Verifique se o arquivo `api/index.js` está correto e se o caminho relativo está certo.

### ❌ Erro: "MongoDB connection failed"

**Solução:** 
1. Verifique se `MONGODB_URI` está configurada corretamente na Vercel
2. Verifique se o IP `0.0.0.0/0` está liberado no MongoDB Atlas

### ❌ Erro: "CORS error"

**Solução:**
1. Atualize `FRONTEND_URL` na Vercel com a URL correta do frontend
2. Certifique-se de que inclui `https://` no início

### ❌ Erro: "Function timeout"

**Solução:** 
- A Vercel tem timeout de 10s no plano gratuito
- Para funções que podem demorar mais (como webhooks), use o `vercel.json` configurado com `maxDuration: 30`
- Considere upgrade para plano Pro se necessário

---

## 📊 Uploads de Arquivos

⚠️ **IMPORTANTE:** A Vercel não persiste arquivos no filesystem!

### Problema:
Os uploads de imagens (`/uploads`) não funcionarão na Vercel porque ela usa filesystem temporário.

### Soluções:

#### Opção 1: Usar Vercel Blob Storage (Recomendado)
- Instalar: `@vercel/blob`
- Modificar `src/middlewares/upload.js` para usar Vercel Blob

#### Opção 2: Usar AWS S3 / Cloudinary / Imgur
- Modificar upload para salvar em serviço externo

#### Opção 3: Para Testes Iniciais
- Desabilitar uploads temporariamente
- Focar em testar outras funcionalidades

---

## 🔒 Segurança

### ✅ Checklist:

- [ ] `.env` não está commitado (está no `.gitignore`)
- [ ] Todas as variáveis sensíveis estão na Vercel
- [ ] `JWT_SECRET` é forte e único
- [ ] `MP_WEBHOOK_SECRET` está configurado
- [ ] MongoDB Atlas tem IP `0.0.0.0/0` liberado ou IP da Vercel
- [ ] CORS está configurado corretamente

---

## 📝 Próximos Passos Após Deploy

1. ✅ Testar endpoints principais
2. ✅ Configurar webhook do Mercado Pago
3. ✅ Testar pagamento PIX em sandbox
4. ✅ Atualizar frontend para usar URL da Vercel
5. ⚠️ Implementar solução para uploads (se necessário)

---

## 🔗 URLs Importantes

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Logs do Deploy:** Vercel → Project → Deployments → [deployment] → Logs
- **Environment Variables:** Vercel → Project → Settings → Environment Variables
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Mercado Pago:** https://www.mercadopago.com.br/developers

---

## ✅ Conclusão

Após seguir este guia, seu backend estará rodando na Vercel e pronto para testes em produção!

**URL do seu backend:** `https://seu-projeto.vercel.app`

Atualize o frontend para usar esta URL nas requisições!

---

**🎉 Boa sorte com o deploy!**

