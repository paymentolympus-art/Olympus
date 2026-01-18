# 🔧 ATIVAR PRODUTOS EXISTENTES

## Por que os produtos estão pendentes?

Os produtos que você criou **ANTES** da atualização ficaram com status `PENDING` porque:
- A ativação automática só funciona para novas ofertas criadas após o deploy
- Produtos existentes precisam ser ativados manualmente uma vez

---

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Chamar rota de ativação em lote (RECOMENDADO)

Abra o Postman e faça esta requisição:

```http
POST https://olympus-payment.vercel.app/api/products/activate-pending
Authorization: Bearer SEU_TOKEN_JWT
```

**Resposta esperada:**
```json
{
  "data": {
    "activated": 2,
    "failed": 0,
    "products": [
      {
        "id": "...",
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

Esta rota vai:
- ✅ Buscar todos os produtos com status PENDING
- ✅ Verificar se cada um tem oferta padrão
- ✅ Validar nome e preço
- ✅ Ativar automaticamente os que estiverem OK

---

### Opção 2: Ativar produto individual

Se preferir ativar um por um:

```http
PATCH https://olympus-payment.vercel.app/api/products/:productId/activate
Authorization: Bearer SEU_TOKEN_JWT
```

Substitua `:productId` pelo ID do produto (exemplo: `696cecd74c27b98db5bc2257`)

---

### Opção 3: Editar a oferta padrão

No frontend:
1. Vá em "Ofertas"
2. Clique nos 3 pontinhos da oferta "of1"
3. Marque como "Oferta Padrão" novamente
4. O produto será ativado automaticamente!

---

## 🎯 PARA NOVOS PRODUTOS

A partir de agora, quando você:
- ✅ Criar a primeira oferta → Produto ativado automaticamente
- ✅ Criar oferta padrão → Produto ativado automaticamente
- ✅ Marcar oferta como padrão → Produto ativado automaticamente

**Não precisa fazer nada manualmente!**

---

## ❓ COMO PEGAR O TOKEN JWT?

1. Abra o DevTools do navegador (F12)
2. Vá na aba "Application" ou "Storage"
3. Procure por "Local Storage"
4. Encontre a chave `@olympuspayment:session` ou similar
5. Copie o valor do token

---

## 🔍 VERIFICAR STATUS DO PRODUTO

```http
GET https://olympus-payment.vercel.app/api/products/:productId/validation
Authorization: Bearer SEU_TOKEN_JWT
```

Retorna o que falta para ativar o produto:
```json
{
  "data": {
    "isValid": true,
    "canActivate": true,
    "errors": [],
    "warnings": [],
    "currentStatus": "PENDING"
  }
}
```

Se `canActivate: true`, pode ativar!

---

## 🚨 IMPORTANTE

Após ativar os produtos:
- ✅ O checkout público vai funcionar
- ✅ Clientes poderão acessar via domínio personalizado
- ✅ Não haverá mais erro "Produto indisponível"

