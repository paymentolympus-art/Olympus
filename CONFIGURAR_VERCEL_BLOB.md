# 📦 CONFIGURAR VERCEL BLOB STORAGE PARA UPLOADS

## ❌ Problema Atual:

**Erro:** `EROFS: read-only file system`

A Vercel não permite salvar arquivos no sistema de arquivos porque:
- É somente leitura (`/var/task` é read-only)
- É efêmero (arquivos são perdidos entre execuções)
- Não persiste entre deploys

---

## ✅ SOLUÇÃO: VERCEL BLOB STORAGE

Implementei suporte para **Vercel Blob Storage**, que é:
- ✅ Nativo da Vercel
- ✅ Grátis até 1GB
- ✅ URLs públicas automáticas
- ✅ Persistente
- ✅ Funciona em produção

---

## 📋 PASSO A PASSO PARA CONFIGURAR:

### **1. Criar Blob Storage na Vercel**

1. Acesse: **https://vercel.com/dashboard**
2. Clique no projeto **`olympus-payment`** (backend)
3. Vá em **Storage** (no menu lateral)
4. Clique em **"Create"** → **"Blob"**
5. Dê um nome: `olympus-payments-blob` (ou qualquer nome)
6. Clique em **"Create"**

### **2. Obter Token de Acesso**

Após criar o Blob:

1. Na página do Blob Storage, vá em **Settings**
2. Vá em **"Access Tokens"**
3. Clique em **"Generate Token"**
4. Dê um nome: `olympus-backend-token`
5. Permissões: **Read and Write**
6. Clique em **"Generate"**
7. **COPIE O TOKEN** (você só verá uma vez!)

### **3. Adicionar Token na Vercel**

1. No projeto backend (`olympus-payment`), vá em **Settings** → **Environment Variables**
2. Clique em **"+ Add New"**
3. Adicione:
   ```
   Key: BLOB_READ_WRITE_TOKEN
   Value: [cole o token que você copiou]
   ```
4. Clique em **"Save"**

### **4. Aguardar Redeploy**

- A Vercel fará redeploy automático após salvar
- Aguarde 2-3 minutos

---

## ✅ PRONTO!

Após configurar o token, o upload funcionará automaticamente!

### **Como Funciona:**

- **Em Produção (Vercel):** Usa Vercel Blob Storage
- **Em Desenvolvimento (Local):** Usa sistema de arquivos local (`/uploads`)

O código detecta automaticamente qual usar!

---

## 🧪 TESTAR:

1. Após o redeploy completar
2. Tente fazer upload de uma imagem novamente
3. Deve funcionar sem erros! ✅

---

## 📋 CHECKLIST:

- [ ] Blob Storage criado na Vercel
- [ ] Token de acesso gerado
- [ ] `BLOB_READ_WRITE_TOKEN` adicionado nas variáveis de ambiente
- [ ] Redeploy completado (aguardar 2-3 minutos)
- [ ] Upload de imagem testado e funcionando

---

## 🆘 PROBLEMAS COMUNS:

### **Erro: "BLOB_READ_WRITE_TOKEN não configurado"**
- **Solução:** Verifique se o token foi adicionado nas variáveis de ambiente
- **Solução:** Aguarde o redeploy completar

### **Erro: "Token inválido"**
- **Solução:** Gere um novo token e atualize nas variáveis de ambiente

### **Upload ainda não funciona**
- **Solução:** Limpe o cache do navegador (Ctrl+Shift+R)
- **Solução:** Verifique os logs da Vercel (Runtime Logs)

---

## 💡 INFORMAÇÕES ADICIONAIS:

### **Planos Vercel Blob:**
- **Hobby (Grátis):** 1GB de armazenamento
- **Pro:** 100GB incluído
- **Enterprise:** Ilimitado

### **Onde as Imagens Ficam:**
- As imagens são salvas no Blob Storage da Vercel
- URLs públicas são geradas automaticamente
- Formato: `https://[blob-url].public.blob.vercel-storage.com/products/...`

---

## 🎉 PRONTO!

Após seguir esses passos, o upload de imagens funcionará perfeitamente em produção!

---

**📌 Nota:** O código já foi atualizado para usar Vercel Blob automaticamente quando `BLOB_READ_WRITE_TOKEN` estiver configurado!


