# 🌐 COMO FUNCIONA O DOMÍNIO PERSONALIZADO + CHECKOUT

## ⚠️ ENTENDENDO O PROBLEMA ATUAL

### **O que você fez:**
1. Criou domínio `testandogat.shop`
2. Configurou CNAME: `pay.testandogat.shop → checkout.olympuspayment.com.br`
3. Verificou DNS (status: VERIFIED)

### **O problema:**
Quando você acessa `pay.testandogat.shop/of1`, o DNS resolve para `checkout.olympuspayment.com.br`, MAS:

❌ **`checkout.olympuspayment.com.br` não existe!**

Você precisa criar esse subdomínio na Vercel e apontar para o backend.

---

## 🔧 SOLUÇÃO: CONFIGURAR DOMÍNIO NA VERCEL

### **Passo 1: Adicionar domínio customizado na Vercel (Backend)**

1. Acesse: https://vercel.com
2. Vá para o projeto do **BACKEND** (`olympus-payment`)
3. Settings → Domains
4. Adicione: `checkout.olympuspayment.com.br`
5. A Vercel vai mostrar os registros DNS necessários

### **Passo 2: Configurar DNS do olympuspayment.com.br**

No seu provedor DNS (onde está o domínio `olympuspayment.com.br`), adicione:

```
Tipo: CNAME
Nome: checkout
Valor: cname.vercel-dns.com
```

Ou o valor que a Vercel indicar.

### **Passo 3: Aguardar propagação**

Pode levar de alguns minutos a 48 horas.

---

## 🔄 FLUXO COMPLETO

```
1. Usuário acessa: pay.testandogat.shop/of1
                      ↓
2. DNS resolve: pay.testandogat.shop → checkout.olympuspayment.com.br
                      ↓
3. Vercel recebe: checkout.olympuspayment.com.br/of1
                      ↓
4. Backend busca oferta pelo slug "of1"
                      ↓
5. Retorna dados do checkout (produto, tema, orderbumps)
                      ↓
6. Frontend renderiza o checkout
```

---

## 📋 ROTAS CRIADAS

### **GET /checkout/:slug**
Busca checkout público por slug da oferta.

**Exemplo:**
```
GET https://checkout.olympuspayment.com.br/of1
```

**Resposta:**
```json
{
  "data": {
    "product": {
      "id": "...",
      "name": "Produto Teste",
      "type": "DIGITAL",
      "paymentFormat": "ONE_TIME",
      "description": "...",
      "image": "https://...",
      "urlBack": "",
      "urlRedirect": "",
      "offer": {
        "id": "...",
        "name": "of1",
        "slug": "of1",
        "price": 19.90,
        "priceFake": 197.00,
        "discount": 90
      },
      "orderBumps": [],
      "shippingOptions": []
    },
    "theme": {
      "theme": "SHOP",
      "steps": "three",
      "font": "Rubik",
      ...
    }
  }
}
```

### **GET /checkout/verify-domain**
Verifica se o domínio está configurado.

---

## 🎯 RESUMO DO QUE PRECISA FAZER

### **1. Na Vercel (projeto backend):**
- Adicionar domínio: `checkout.olympuspayment.com.br`

### **2. No DNS do olympuspayment.com.br:**
- Adicionar CNAME: `checkout → cname.vercel-dns.com`

### **3. Aguardar propagação DNS**

### **4. Testar:**
```
https://checkout.olympuspayment.com.br/of1
```

Se funcionar, então `pay.testandogat.shop/of1` também vai funcionar!

---

## 💡 ALTERNATIVA: USAR BACKEND DIRETO

Se não quiser configurar domínio customizado agora, você pode:

1. Usar a URL do backend direto:
```
https://olympus-payment.vercel.app/checkout/of1
```

2. Ou mudar o CNAME do seu domínio para apontar direto para o backend:
```
pay.testandogat.shop → olympus-payment.vercel.app
```

---

## 📊 STATUS ATUAL

- ✅ Rotas de checkout público criadas
- ✅ Backend pronto para receber requisições
- ⏳ Falta configurar `checkout.olympuspayment.com.br` na Vercel
- ⏳ Falta configurar DNS do olympuspayment.com.br

---

**Após configurar, faça redeploy e teste!** 🚀


