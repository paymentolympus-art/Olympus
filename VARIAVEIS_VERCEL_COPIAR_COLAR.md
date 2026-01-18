# 📋 VARIÁVEIS DE AMBIENTE - COPIAR E COLAR

## 🎯 Use este arquivo para copiar e colar as variáveis na Vercel!

---

## 📦 BACKEND - VARIÁVEIS NECESSÁRIAS

### **1. MONGODB_URI**
```
MONGODB_URI
```
**Valor:** Cole aqui sua connection string do MongoDB Atlas

**Exemplo:**
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/insane-pay?retryWrites=true&w=majority
```

---

### **2. MERCADOPAGO_ACCESS_TOKEN**
```
MERCADOPAGO_ACCESS_TOKEN
```
**Valor:** Cole aqui seu Access Token do Mercado Pago

**Exemplo:**
```
TEST-1234567890123456-123456-abcdef1234567890abcdef1234567890-123456789
```

---

### **3. MP_WEBHOOK_SECRET**
```
MP_WEBHOOK_SECRET
```
**Valor:** Cole aqui seu Webhook Secret do Mercado Pago

**Exemplo:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### **4. JWT_SECRET**
```
JWT_SECRET
```
**Valor:** Cole aqui uma chave secreta aleatória e segura

**Exemplo (você pode usar esta ou criar uma nova):**
```
insane-pay-jwt-secret-key-2024-super-secure-random-string-123456789-abcdefghijklmnopqrstuvwxyz
```

**💡 Dica:** Gere uma chave aleatória longa e segura!

---

### **5. FRONTEND_URL**
```
FRONTEND_URL
```
**Valor:**
```
https://olympus-frontend-swart.vercel.app
```
⚠️ **IMPORTANTE:** Se a URL do seu frontend for diferente, ajuste aqui!

---

### **6. BACKEND_URL**
```
BACKEND_URL
```
**Valor:**
```
https://olympus-payment.vercel.app
```

---

### **7. DOMAIN_CNAME_VALUE (OPCIONAL)**
```
DOMAIN_CNAME_VALUE
```
**Valor:**
```
checkout.insanepay.com.br
```
⚠️ **OPCIONAL:** Só adicione se for usar domínios personalizados.

---

## 🎨 FRONTEND - VARIÁVEL NECESSÁRIA

### **1. VITE_URL**
```
VITE_URL
```
**Valor:**
```
https://olympus-payment.vercel.app
```

---

## 📝 COMO USAR:

1. **Na Vercel:**
   - Vá em Settings → Environment Variables
   - Clique em "+ Add New"
   - Cole o **Key** (nome da variável)
   - Cole o **Value** (valor da variável)
   - Clique em "Save"
   - Repita para cada variável

2. **Após adicionar todas:**
   - A Vercel fará redeploy automático
   - Aguarde 2-3 minutos
   - Teste acessando `/health`

---

## ✅ CHECKLIST:

### Backend (6-7 variáveis):
- [ ] MONGODB_URI
- [ ] MERCADOPAGO_ACCESS_TOKEN
- [ ] MP_WEBHOOK_SECRET
- [ ] JWT_SECRET
- [ ] FRONTEND_URL
- [ ] BACKEND_URL
- [ ] DOMAIN_CNAME_VALUE (opcional)

### Frontend (1 variável):
- [ ] VITE_URL

---

**🎉 Pronto! Após adicionar todas, seu gateway estará funcionando!**

