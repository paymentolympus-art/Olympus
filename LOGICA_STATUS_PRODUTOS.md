# 📊 LÓGICA DE STATUS DE PRODUTOS

## 🎯 STATUS DISPONÍVEIS

1. **PENDING** (Pendente) - Padrão ao criar
2. **ACTIVE** (Ativo) - Produto disponível para venda
3. **DISABLED** (Desabilitado) - Produto desativado manualmente
4. **REJECTED** (Rejeitado) - Produto rejeitado (futuro: aprovação manual)

---

## ✅ REQUISITOS PARA ATIVAR UM PRODUTO

Um produto precisa ter:

1. ✅ **Nome** válido (mínimo 3 caracteres)
2. ✅ **Preço** maior que zero
3. ✅ **Pelo menos 1 oferta padrão** criada
4. ✅ **Descrição** (opcional, mas recomendado)
5. ✅ **URL de redirecionamento** configurada (opcional)

---

## 🔄 FLUXO DE ATIVAÇÃO

### **Opção 1: Ativação Automática (Recomendado)**
Quando o usuário:
1. Cria o produto → Status: PENDING
2. Cria oferta padrão → Valida requisitos automaticamente
3. Se todos requisitos OK → Status muda para ACTIVE automaticamente

### **Opção 2: Ativação Manual**
Usuário clica em "Ativar Produto":
1. Sistema valida todos requisitos
2. Se OK → Status muda para ACTIVE
3. Se faltar algo → Retorna erros específicos

---

## 🚫 VALIDAÇÕES

### **Ao tentar ativar:**

```javascript
// Validar se produto tem oferta padrão
const defaultOffer = await Offer.findOne({ productId, isDefault: true });
if (!defaultOffer) {
  return error('Produto precisa ter uma oferta padrão');
}

// Validar preço
if (product.price <= 0) {
  return error('Produto precisa ter preço maior que zero');
}

// Validar nome
if (product.name.length < 3) {
  return error('Nome do produto inválido');
}
```

---

## 📋 IMPLEMENTAÇÃO

### **Rotas necessárias:**

1. **PATCH /api/products/:id/activate**
   - Ativa produto (muda status para ACTIVE)
   - Valida requisitos
   - Retorna erros se faltar algo

2. **PATCH /api/products/:id/status**
   - Atualiza status manualmente
   - Permite: ACTIVE, DISABLED, PENDING
   - Valida requisitos se tentar ativar

3. **GET /api/products/:id/validation**
   - Retorna status de validação
   - Lista o que está faltando
   - Usado no frontend para mostrar o que falta

---

## 💡 LÓGICA ATUAL

### **Status Padrão:**
- Novos produtos: **PENDING**

### **Atualização de Status:**
- `PUT /api/products/:id` permite alterar status
- MAS não valida requisitos antes de ativar

### **Problema:**
- Produto pode ser ativado sem ter oferta padrão
- Isso causa erro no checkout público

---

## 🔧 CORREÇÕES NECESSÁRIAS

1. ✅ Criar validação ao ativar produto
2. ✅ Criar rota específica `/activate`
3. ✅ Criar rota `/validation` para frontend mostrar o que falta
4. ✅ Adicionar botão "Ativar" no frontend
5. ✅ Mostrar avisos sobre o que está faltando

---

## 🎨 FRONTEND

### **O que mostrar:**

1. **Badge de status** (já existe)
2. **Botão "Ativar Produto"** (se PENDING e requisitos OK)
3. **Lista de requisitos faltando** (se PENDING e requisitos faltando)
4. **Toggle Ativar/Desativar** (se ACTIVE ou DISABLED)

---

**Implementação será feita agora!** 🚀


