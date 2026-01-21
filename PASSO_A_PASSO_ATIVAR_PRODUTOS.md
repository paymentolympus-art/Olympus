# 🎯 PASSO A PASSO: ATIVAR PRODUTOS PENDENTES

## 🚀 OPÇÃO 1: Pelo Frontend (MAIS FÁCIL)

### Passo 1: Abra seu produto
- Vá em: `https://olympuspayment.com.br/user/products`
- Clique no produto "teste"

### Passo 2: Vá na aba "Ofertas"
- Procure a oferta "of1" (Padrão)

### Passo 3: Marque como padrão novamente
- Clique nos **3 pontinhos** ao lado da oferta
- Clique em **"Marcar como Padrão"**
- Produto será ativado automaticamente!

### ✅ Pronto!
- Status muda de PENDENTE → ATIVO
- Checkout público funciona!

---

## 🔧 OPÇÃO 2: Via Postman (ATIVA TODOS DE UMA VEZ)

### Passo 1: Pegue seu Token JWT

**No navegador (Chrome/Edge):**
1. Pressione `F12` (abre DevTools)
2. Vá na aba **Application** (ou Storage)
3. No menu lateral esquerdo:
   - Clique em **Local Storage**
   - Clique em `https://olympuspayment.com.br`
4. Procure a chave: `@olympuspayment:session` ou `session`
5. Copie o valor (será algo como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Passo 2: Abra o Postman

**Se não tem Postman:**
- Baixe em: https://www.postman.com/downloads/
- Ou use a versão web: https://web.postman.com/

### Passo 3: Configure a requisição

**Método:** `POST`

**URL:**
```
https://olympus-payment.vercel.app/api/products/activate-pending
```

**Headers:**
- Clique na aba "Headers"
- Adicione:
  - **Key:** `Authorization`
  - **Value:** `Bearer SEU_TOKEN_AQUI`
  
  ⚠️ **IMPORTANTE:** Coloque `Bearer ` (com espaço) antes do token!
  
  Exemplo:
  ```
  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTZj...
  ```

**Body:**
- Deixe em branco (não precisa)

### Passo 4: Envie a requisição
- Clique no botão **"Send"**

### Passo 5: Verifique a resposta

**Resposta de sucesso (200 OK):**
```json
{
  "data": {
    "activated": 2,
    "failed": 0,
    "products": [
      {
        "id": "696cecd74c27b98db5bc2257",
        "name": "teste"
      },
      {
        "id": "...",
        "name": "testebump"
      }
    ],
    "message": "2 produto(s) ativado(s) com sucesso"
  }
}
```

### ✅ Pronto!
- Todos produtos pendentes foram ativados!
- Recarregue a página de produtos para ver o novo status

---

## 📝 OPÇÃO 3: Ativar Produto Individual

**Se quiser ativar só 1 produto:**

### Passo 1: Pegue o ID do produto
- Na tela de produtos, clique no produto
- Copie o ID da URL (depois de `/products/`)
- Exemplo: `696cecd74c27b98db5bc2257`

### Passo 2: Configure no Postman

**Método:** `PATCH`

**URL:**
```
https://olympus-payment.vercel.app/api/products/696cecd74c27b98db5bc2257/activate
```
*(substitua pelo ID do seu produto)*

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Passo 3: Envie
- Clique em **"Send"**

**Resposta:**
```json
{
  "message": "Produto ativado com sucesso",
  "data": {
    "id": "696cecd74c27b98db5bc2257",
    "name": "teste",
    "status": "ACTIVE"
  }
}
```

---

## ❓ PERGUNTAS FREQUENTES

### ❌ "Token inválido" ou "401 Unauthorized"
- Token expirou ou está incorreto
- Faça logout e login novamente
- Pegue o token novo do Local Storage

### ❌ "Não é possível ativar"
- Produto não tem oferta padrão
- Ou preço está zerado
- Crie uma oferta padrão primeiro

### ❌ "CORS error"
- Ignore, é apenas do navegador
- No Postman não acontece

### ✅ Produtos continuam pendentes após chamar a rota?
- Faça logout/login no frontend
- Ou force refresh: `Ctrl + Shift + R`

---

## 🎉 RESULTADO FINAL

Após ativar os produtos:

✅ **Status muda:** PENDENTE → ATIVO

✅ **Checkout público funciona:**
```
https://pay.testandogat.shop/of1
```

✅ **Pode vender!**

---

## 🆘 PRECISA DE AJUDA?

Se nenhuma das opções funcionou, me avise e vou te ajudar!



