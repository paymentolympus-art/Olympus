# 🚀 DEPLOY NA VERCEL - RESUMO RÁPIDO

## ⚡ Início Rápido

### 1️⃣ Preparar Git
```bash
# Execute o script PowerShell
.\PREPARAR_DEPLOY.ps1

# OU manualmente:
git init
git add .
git commit -m "Preparando para deploy na Vercel"
```

### 2️⃣ Criar Repositório GitHub
- Acesse: https://github.com/new
- Crie repositório (SEM README)
- Conecte:
```bash
git remote add origin https://github.com/SEU-USUARIO/insane-backend.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy na Vercel
- Acesse: https://vercel.com/new
- Importe repositório
- Configure variáveis de ambiente (veja abaixo)
- Deploy!

---

## 🔐 Variáveis de Ambiente Obrigatórias

Configure na Vercel (Settings → Environment Variables):

```
MONGODB_URI = mongodb+srv://...
MERCADOPAGO_ACCESS_TOKEN = TEST-...
MP_WEBHOOK_SECRET = ...
JWT_SECRET = ...
FRONTEND_URL = https://seu-frontend.vercel.app
BACKEND_URL = https://seu-backend.vercel.app (atualize após deploy)
```

---

## 📖 Documentação Completa

- **Guia Detalhado:** `PASSO_A_PASSO_DEPLOY.md`
- **Guia Técnico:** `DEPLOY_VERCEL.md`
- **Aviso Uploads:** `AVISO_UPLOADS_VERCEL.md`

---

**✅ Pronto para deploy!**



