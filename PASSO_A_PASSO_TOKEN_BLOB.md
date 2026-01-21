# 🔑 PASSO A PASSO: GERAR TOKEN DO BLOB STORAGE

## 📍 ONDE VOCÊ ESTÁ:
Você está na página do Blob Storage: **"olympus-payments-blob"**

---

## ✅ PRÓXIMOS PASSOS:

### **1️⃣ Acessar Settings (Configurações)**

Na página atual do Blob Storage, procure por:
- Um menu lateral à esquerda (se houver)
- OU uma aba/tab chamada **"Settings"** no topo
- OU um ícone de ⚙️ (engrenagem) ou ⋮ (três pontos)
- OU clique em **"Open in Observability"** e depois procure Settings

**O que você procura:** Uma seção chamada **"Access Tokens"** ou **"Tokens"**

---

### **2️⃣ Gerar Token de Acesso**

1. Dentro de **Settings**, procure por **"Access Tokens"**
2. Clique em **"Generate Token"** ou **"Create Token"**
3. Preencha:
   - **Name:** `olympus-backend-token` (ou qualquer nome)
   - **Permissions:** Selecione **"Read and Write"** (Leitura e Escrita)
4. Clique em **"Generate"** ou **"Create"**

---

### **3️⃣ COPIAR O TOKEN ⚠️ IMPORTANTE!**

Após gerar, o token aparecerá algo como:
```
vercel_blob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ COPIE ESSE TOKEN AGORA!** Você só verá uma vez!

---

### **4️⃣ Adicionar Token nas Variáveis de Ambiente**

1. Na Vercel, volte para o projeto **"olympus-payment"** (não o Blob Storage)
   - Clique em **"← All Databases"** ou no nome do projeto no topo
   - OU acesse: https://vercel.com/dashboard → Seu projeto → Settings

2. No projeto **olympus-payment**, vá em:
   - **Settings** → **Environment Variables**

3. Clique em **"+ Add New"**

4. Preencha:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** [Cole o token que você copiou]
   - **Environment:** Selecione **"Production"** (ou "Production, Preview, Development" para todos)

5. Clique em **"Save"**

---

### **5️⃣ Aguardar Redeploy**

- A Vercel fará redeploy automático
- Aguarde **2-3 minutos**
- Você pode verificar o progresso em **"Deployments"**

---

## ✅ PRONTO!

Após esses passos, o upload de imagens funcionará em produção!

---

## 🆘 NÃO ENCONTROU "Access Tokens"?

Se não encontrar a opção de gerar token:

1. **Tente clicar em "Open in Observability"** e procurar Settings lá
2. OU procure por **"API"** ou **"Tokens"** no menu lateral
3. OU verifique se há uma aba **"Access Control"** ou **"Security"**

---

## 📸 IMAGENS REFERÊNCIA:

Você deve ver algo assim quando encontrar:
- Seção "Access Tokens"
- Botão "Generate Token" ou "Create Token"
- Campo para nome do token
- Opções de permissões (Read, Write, etc.)

---

## 🎯 RESUMO RÁPIDO:

1. ✅ Blob Storage criado (já feito!)
2. ⏳ Gerar Token (você está aqui!)
3. ⏳ Adicionar Token nas variáveis de ambiente
4. ⏳ Aguardar redeploy
5. ⏳ Testar upload

---

Avise quando encontrar o "Access Tokens" ou se tiver alguma dúvida!



