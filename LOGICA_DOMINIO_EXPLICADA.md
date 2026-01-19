# 🌐 LÓGICA DE DOMÍNIOS - EXPLICAÇÃO COMPLETA

## 📋 COMO FUNCIONA:

### **1. Você adiciona um domínio:**
- Exemplo: `testandogat.shop`

### **2. O sistema cria um subdomínio padrão:**
- Subdomínio: `pay.testandogat.shop`
- (Você pode mudar o nome do subdomínio, mas o padrão é `pay`)

### **3. Você precisa configurar DNS:**
- Tipo: **CNAME**
- Nome: `pay` (ou o nome que você escolheu)
- Valor: `checkout.olympuspayment.com.br`

### **4. O que acontece quando você aponta:**
Quando você configura o DNS:
```
pay.testandogat.shop → CNAME → checkout.olympuspayment.com.br
```

Isso significa:
- Quando alguém acessa `pay.testandogat.shop`, o DNS redireciona para `checkout.olympuspayment.com.br`
- O checkout da Olympus Payment será servido no seu domínio customizado
- Isso permite ter URLs personalizadas para seus produtos

---

## ✅ VERIFICAÇÃO DNS:

O sistema verifica se o CNAME está configurado corretamente:

1. Faz consulta DNS para `pay.testandogat.shop`
2. Verifica se o CNAME aponta para `checkout.olympuspayment.com.br`
3. Se estiver correto, status muda para **"VERIFIED"**
4. Se estiver incorreto ou não configurado, status fica **"ERROR"**

---

## 🎯 EXEMPLO PRÁTICO:

### **Configuração:**
```
Domínio: testandogat.shop
Subdomínio: pay
CNAME: pay.testandogat.shop → checkout.olympuspayment.com.br
```

### **Resultado:**
- `pay.testandogat.shop` → redireciona para checkout da Olympus
- Você pode usar esse domínio personalizado nos seus produtos
- Checkout será servido no seu domínio customizado

---

## 🔧 VARIÁVEIS DE AMBIENTE:

Você pode configurar na Vercel:

```
DOMAIN_CNAME_VALUE=checkout.olympuspayment.com.br
```

Isso permite mudar o destino dos CNAMEs sem alterar código.

---

## 📊 STATUS DO DOMÍNIO:

- **PENDING**: Domínio criado, aguardando verificação
- **VERIFIED**: CNAME configurado corretamente, domínio funcionando
- **ERROR**: CNAME não configurado ou incorreto

---

## 💡 DICAS:

1. **Propagação DNS:** Após configurar, pode levar até 48h para propagar
2. **Verificação:** Use o botão "Verificar Agora" periodicamente
3. **SSL:** O checkout precisa ter certificado SSL válido (HTTPS)
4. **Múltiplos Domínios:** Você pode ter vários domínios por produto

---

## 🚀 PRÓXIMOS PASSOS:

1. Criar domínio no sistema
2. Configurar CNAME no seu provedor DNS
3. Aguardar propagação (pode levar algumas horas)
4. Clicar em "Verificar Agora"
5. Quando status mudar para "VERIFIED", usar nos produtos!

---

**Agora o sistema está configurado para usar `checkout.olympuspayment.com.br`!** ✅


