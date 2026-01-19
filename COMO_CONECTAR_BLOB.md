# ✅ CONECTAR BLOB STORAGE AO PROJETO

## 🎯 O QUE VOCÊ ESTÁ VENDO:

Modal **"Connect Project"** da Vercel - isso conecta o Blob Storage ao seu projeto backend!

---

## 📋 PASSO A PASSO:

### **1️⃣ Selecionar o Projeto:**

No campo **"Search Projects..."**:
- Digite: `olympus-payment`
- OU clique na lista e selecione **"olympus-payment"**

---

### **2️⃣ Verificar Ambientes:**

Mantenha **TODOS** os ambientes marcados:
- ✅ **Development** (para testes locais)
- ✅ **Preview** (para previews)
- ✅ **Production** (para produção)

Isso permite que o Blob funcione em todos os ambientes!

---

### **3️⃣ Verificar Prefixo:**

O campo **"Custom Prefix"** já está correto:
```
BLOB_READ_WRITE_TOKEN
```

**Não precisa mudar nada aqui!** Isso será o nome da variável de ambiente.

---

### **4️⃣ Clicar em "Connect":**

Clique no botão azul **"Connect"** no canto inferior direito.

---

## ✨ O QUE ACONTECE DEPOIS:

1. ✅ A Vercel **cria automaticamente** a variável de ambiente `BLOB_READ_WRITE_TOKEN`
2. ✅ Conecta o Blob Storage ao projeto `olympus-payment`
3. ✅ Faz **redeploy automático** do backend
4. ✅ Em **2-3 minutos**, o upload funcionará em produção!

---

## 🎉 PRONTO!

Após clicar em "Connect", você está praticamente pronto!

A Vercel faz tudo automaticamente - você só precisa aguardar o redeploy completar.

---

## ✅ VERIFICAR (OPCIONAL):

Se quiser confirmar que funcionou:

1. Vá em **Settings** → **Environment Variables** do projeto `olympus-payment`
2. Procure por `BLOB_READ_WRITE_TOKEN`
3. Deve aparecer lá automaticamente!

---

**Agora é só clicar em "Connect" e aguardar!** 🚀


