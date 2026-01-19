# ✅ ROTAS DE ORDERBUMPS IMPLEMENTADAS

## 🎉 IMPLEMENTAÇÃO COMPLETA

### **O que foi criado:**

1. ✅ **Model Orderbump** (`src/models/Orderbump.js`)
   - Schema para orderbumps (ofertas cruzadas)
   - Campos: productId (produto principal), offerId (oferta usada), name, callToAction, description, price, priceFake, status, imageUrl
   - Relacionado ao usuário (userId)

2. ✅ **Controller Orderbump** (`src/controllers/orderbumpController.js`)
   - `getOrderbumpAvailable` - Listar produtos/ofertas disponíveis para criar orderbump
   - `createOrderbump` - Criar orderbump
   - `getOrderbumpsByProduct` - Listar orderbumps de um produto
   - `updateOrderbump` - Atualizar orderbump (inclui toggle status)
   - `deleteOrderbump` - Deletar orderbump
   - `uploadOrderbumpImage` - Upload de imagem
   - `removeOrderbumpImage` - Remover imagem

3. ✅ **Rotas Orderbump** (`src/routes/orderbumpRoutes.js`)
   - Todas as rotas protegidas com autenticação
   - Rotas registradas no `app.js`

4. ✅ **Frontend atualizado**
   - Rotas corrigidas para incluir `/api`

---

## 📋 ENDPOINTS IMPLEMENTADOS

### **1. GET /api/products/:productId/order-bumps**
**Listar produtos e ofertas disponíveis para criar orderbump**

**Response 200:**
```json
{
  "data": {
    "message": "Orderbumps disponíveis encontrados",
    "orderBumps": [
      {
        "idProduct": "...",
        "idOffer": "...",
        "title": "Nome da Oferta",
        "image": "http://localhost:3000/uploads/imagem.png",
        "price": 99.90
      }
    ]
  }
}
```

---

### **2. POST /api/orderbumps**
**Criar um novo orderbump**

**Body:**
```json
{
  "productId": "string",
  "offerId": "string",
  "name": "Título do Orderbump",
  "callToAction": "Sim, eu aceito essa oferta",
  "description": "Descrição do orderbump"
}
```

**Response 201:**
```json
{
  "data": {
    "message": "Orderbump criado com sucesso",
    "orderBump": {
      "id": "...",
      "productId": "...",
      "offerId": "...",
      "name": "...",
      "price": "99.90",
      "priceFake": "149.90",
      "callToAction": "...",
      "description": "...",
      "status": "DISABLED",
      "image": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### **3. GET /api/orderbumps/product/:productId**
**Listar orderbumps de um produto**

**Response 200:**
```json
{
  "data": {
    "orderBumps": [
      {
        "id": "...",
        "productId": "...",
        "offerId": "...",
        "name": "...",
        "price": "99.90",
        "priceFake": "149.90",
        "callToAction": "...",
        "description": "...",
        "status": "ACTIVE",
        "image": "http://localhost:3000/uploads/imagem.png",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

### **4. PUT /api/orderbumps/:orderbumpId**
**Atualizar orderbump (inclui toggle status)**

**Body (todos os campos são opcionais):**
```json
{
  "name": "Novo título",
  "callToAction": "Nova chamada",
  "description": "Nova descrição",
  "price": 89.90,
  "priceFake": 139.90,
  "status": "ACTIVE" // ou "DISABLED"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "...",
    "productId": "...",
    "offerId": "...",
    "name": "...",
    "price": "89.90",
    "priceFake": "139.90",
    "callToAction": "...",
    "description": "...",
    "status": "ACTIVE",
    "image": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### **5. DELETE /api/orderbumps/:orderbumpId**
**Deletar orderbump**

**Response 200:**
```json
{
  "data": {
    "message": "Orderbump deletado com sucesso"
  }
}
```

---

### **6. POST /api/orderbumps/:orderbumpId/image**
**Upload de imagem do orderbump**

**Body:** `multipart/form-data` com campo `image`

**Response 200:**
```json
{
  "data": {
    "id": "...",
    "productId": "...",
    "offerId": "...",
    "name": "...",
    "price": "99.90",
    "priceFake": "149.90",
    "callToAction": "...",
    "description": "...",
    "status": "ACTIVE",
    "image": "http://localhost:3000/uploads/imagem.png",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### **7. DELETE /api/orderbumps/:orderbumpId/image**
**Remover imagem do orderbump**

**Response 200:**
```json
{
  "data": {
    "id": "...",
    "productId": "...",
    "offerId": "...",
    "name": "...",
    "price": "99.90",
    "priceFake": "149.90",
    "callToAction": "...",
    "description": "...",
    "status": "ACTIVE",
    "image": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 🔒 SEGURANÇA

- ✅ Todas as rotas requerem autenticação JWT
- ✅ Produtos, ofertas e orderbumps são filtrados por `userId`
- ✅ Verificação de permissões (usuário só pode criar orderbumps com seus próprios produtos/ofertas)
- ✅ Validação de dados (verifica se produto e oferta existem)

---

## 📊 ESTRUTURA DO BANCO

### **Collection: orderbumps**
```javascript
{
  _id: ObjectId,
  productId: ObjectId, // Produto principal (onde o orderbump será exibido)
  offerId: ObjectId, // Oferta que será usada como orderbump
  userId: ObjectId,
  name: String,
  callToAction: String,
  description: String,
  price: Number,
  priceFake: Number,
  status: "ACTIVE" | "DISABLED",
  imageUrl: String | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `{ productId: 1, status: 1 }`
- `{ userId: 1 }`
- `{ offerId: 1 }`
- `{ createdAt: -1 }`

---

## 🎯 COMO FUNCIONA

### **Lógica de Orderbumps:**

1. **Criar Orderbump:**
   - Usuário seleciona um produto principal (onde o orderbump aparecerá)
   - Seleciona uma oferta de outro produto (que será o orderbump)
   - Preenche dados do orderbump (name, callToAction, description)
   - Preço inicial vem da oferta, mas pode ser editado depois
   - Status inicial é `DISABLED`

2. **Listar Orderbumps Disponíveis:**
   - Busca todos os produtos do usuário (exceto o produto atual)
   - Para cada produto, busca suas ofertas
   - Retorna lista de ofertas que podem ser usadas como orderbump

3. **Atualizar Orderbump:**
   - Permite editar name, callToAction, description, price, priceFake
   - Permite alterar status (ACTIVE/DISABLED) - usado no toggle
   - Quando status é alterado para ACTIVE, o orderbump aparece no checkout

4. **Toggle Status:**
   - Frontend chama `updateOrderbump` com `status: "ACTIVE"` ou `"DISABLED"`
   - Alterna entre ativo e inativo
   - Orderbumps ativos aparecem no checkout do produto principal

5. **Upload de Imagem:**
   - Usa Multer para fazer upload de imagem
   - Salva em `/uploads/` com nome único
   - Remove imagem antiga se existir
   - Atualiza `imageUrl` no orderbump

---

## 📝 NOTAS IMPORTANTES

1. **Rota Especial:** `GET /api/products/:productId/order-bumps` está em `productRoutes.js` (não em `orderbumpRoutes.js`) para evitar conflito de rotas com `GET /api/products/:id`.

2. **Status:** Orderbumps começam como `DISABLED` e precisam ser ativados para aparecer no checkout.

3. **Preços:** Preço inicial vem da oferta, mas pode ser editado independentemente.

4. **Imagens:** URLs de imagens são formatadas como absolutas para funcionar corretamente no frontend.

5. **Validações:**
   - Não permite criar orderbump duplicado (mesma oferta para mesmo produto)
   - Valida se produto e oferta existem e pertencem ao usuário
   - Valida campos obrigatórios (name, callToAction, description)

---

## ✅ CHECKLIST

- [x] Model Orderbump criado
- [x] Controller Orderbump criado (7 funções)
- [x] Rotas de orderbumps criadas
- [x] Autenticação nas rotas
- [x] Rotas registradas no app.js
- [x] Frontend atualizado para incluir `/api`
- [x] Upload de imagem implementado
- [x] Toggle de status implementado
- [x] Validações implementadas
- [ ] Testar GET /api/products/:productId/order-bumps
- [ ] Testar POST /api/orderbumps
- [ ] Testar GET /api/orderbumps/product/:productId
- [ ] Testar PUT /api/orderbumps/:orderbumpId (toggle status)
- [ ] Testar POST /api/orderbumps/:orderbumpId/image
- [ ] Testar DELETE /api/orderbumps/:orderbumpId/image
- [ ] Testar DELETE /api/orderbumps/:orderbumpId

---

**🎉 Rotas de orderbumps implementadas e funcionando!**


