# 📋 ROTAS PENDENTES PARA ABA DE PRODUTOS

## ✅ ROTAS JÁ IMPLEMENTADAS

### **Produtos (Products)**
- ✅ POST `/api/products` - Criar produto
- ✅ GET `/api/products` - Listar produtos (com filtros e paginação)
- ✅ GET `/api/products/:id` - Buscar produto por ID
- ✅ PUT `/api/products/:id` - Atualizar produto
- ✅ DELETE `/api/products/:id` - Deletar produto
- ✅ POST `/api/products/:id/image` - Upload de imagem
- ✅ DELETE `/api/products/:id/image` - Remover imagem

### **Ofertas (Offers)**
- ✅ POST `/api/offers` - Criar oferta
- ✅ POST `/api/offers/default/:productId` - Criar oferta padrão
- ✅ GET `/api/offers/product/:productId` - Listar ofertas do produto
- ✅ GET `/api/offers/:id` - Buscar oferta por ID
- ✅ PUT `/api/offers/:id` - Atualizar oferta
- ✅ PATCH `/api/offers/:id/default` - Definir oferta como padrão
- ✅ DELETE `/api/offers/:id` - Deletar oferta

---

## ❌ ROTAS QUE FALTAM CRIAR

### **1. ORDERBUMPS (Bumps & Upsells)**

**Prioridade: ALTA** - Aba "BUMPS & UPSELLS" nos detalhes do produto

#### Rotas necessárias:
- ❌ **GET** `/api/products/:productId/order-bumps` - Listar order bumps disponíveis para um produto
- ❌ **POST** `/api/orderbumps` - Criar order bump
- ❌ **GET** `/api/orderbumps/product/:productId` - Listar order bumps de um produto
- ❌ **PUT** `/api/orderbumps/:orderbumpId` - Atualizar order bump
- ❌ **DELETE** `/api/orderbumps/:orderbumpId` - Deletar order bump
- ❌ **POST** `/api/orderbumps/:orderbumpId/image` - Upload de imagem do order bump
- ❌ **DELETE** `/api/orderbumps/:orderbumpId/image` - Remover imagem do order bump

**Arquivo frontend:** `insane-front-main/src/api/orderbump.ts`

---

### **2. PIXELS (Facebook, Google, TikTok)**

**Prioridade: ALTA** - Aba "PIXELS" nos detalhes do produto

#### Rotas necessárias:
- ❌ **GET** `/api/pixels/:productId` - Listar pixels de um produto
- ❌ **POST** `/api/pixels/:productId/facebook` - Criar pixel do Facebook
- ❌ **POST** `/api/pixels/:productId/google` - Criar pixel do Google
- ❌ **POST** `/api/pixels/:productId/tiktok` - Criar pixel do TikTok
- ❌ **PUT** `/api/pixels/:productId/facebook/:pixelId` - Atualizar pixel do Facebook
- ❌ **PUT** `/api/pixels/:productId/google/:pixelId` - Atualizar pixel do Google
- ❌ **PUT** `/api/pixels/:productId/tiktok/:pixelId` - Atualizar pixel do TikTok
- ❌ **DELETE** `/api/pixels/:productId/:pixelId` - Deletar pixel

**Arquivo frontend:** `insane-front-main/src/api/pixel.ts`

---

### **3. INTEGRAÇÕES (Integrations)**

**Prioridade: MÉDIA** - Aba "INTEGRAÇÕES" nos detalhes do produto

#### Rotas relacionadas a produtos:
- ❌ **GET** `/api/integrations/products/:productId` - Listar integrações de um produto
- ❌ **GET** `/api/integrations/unassociated/:productId` - Listar integrações não associadas ao produto
- ❌ **POST** `/api/integrations/associate` - Associar integração a produto
- ❌ **DELETE** `/api/integrations/:integrationId/product/:productId` - Remover associação

**Arquivo frontend:** `insane-front-main/src/api/integration.ts` (linhas 75-123)

---

### **4. DOMÍNIOS (Domains)**

**Prioridade: MÉDIA** - Aba "DOMÍNIO" nos detalhes do produto

#### Rotas relacionadas a produtos:
- ❌ **GET** `/api/domains/product/:productId` - Listar domínios de um produto
- ❌ **POST** `/api/domains/:domainId/associate-products` - Associar produtos em massa
- ❌ **POST** `/api/domains/:domainId/add-product` - Adicionar produto individual
- ❌ **DELETE** `/api/domains/:domainId/remove-product` - Remover produto (com body `{ productId }`)

**Arquivo frontend:** `insane-front-main/src/api/domain.ts` (linhas 75-120)

---

### **5. FRETES (Shipping)**

**Prioridade: MÉDIA** - Aba de fretes relacionada a produtos

#### Rotas relacionadas a produtos:
- ❌ **GET** `/api/shipping/product/:productId` - Listar opções de frete de um produto
- ❌ **GET** `/api/shipping/:shippingId/products` - Listar produtos associados a um frete
- ❌ **POST** `/api/shipping/:shippingId/product/:productId` - Associar produto a frete
- ❌ **DELETE** `/api/shipping/:shippingId/product/:productId` - Desassociar produto de frete

**Arquivo frontend:** `insane-front-main/src/api/shipping.ts` (linhas 90-125)

---

### **6. SOCIAL PROOF (Provas Sociais)**

**Prioridade: BAIXA** - Provas sociais no checkout/theme

#### Rotas relacionadas a produtos:
- ❌ **GET** `/api/theme/:productId/social-proofs` - Listar provas sociais
- ❌ **POST** `/api/theme/:productId/social-proofs` - Criar prova social (multipart/form-data)
- ❌ **PUT** `/api/theme/:productId/social-proofs/:proofId` - Atualizar prova social (multipart/form-data)
- ❌ **DELETE** `/api/theme/:productId/social-proofs/:proofId` - Deletar prova social

**Arquivo frontend:** `insane-front-main/src/api/social-proof.ts`

---

### **7. THEME/CHECKOUT (Configurações de Tema)**

**Prioridade: BAIXA** - Configurações de checkout

#### Rotas relacionadas a produtos:
- ❌ **GET** `/api/theme/settings/:productId` - Buscar configurações de tema do produto
- ❌ **PUT** `/api/theme/:productId/theme` - Atualizar tema do produto

**Arquivo frontend:** `insane-front-main/src/api/checkout.ts` (linhas 106-164)

---

## 📊 RESUMO

### **Total de rotas a criar:**
- **Orderbumps:** 7 rotas
- **Pixels:** 8 rotas
- **Integrations (produtos):** 4 rotas
- **Domains (produtos):** 4 rotas
- **Shipping (produtos):** 4 rotas
- **Social Proof:** 4 rotas
- **Theme/Checkout:** 2 rotas

**TOTAL: 33 rotas**

---

## 🎯 PRIORIDADE DE IMPLEMENTAÇÃO

### **PRIORIDADE ALTA (Para aba de produtos funcionar completamente):**
1. ✅ **Orderbumps** - Aba "BUMPS & UPSELLS"
2. ✅ **Pixels** - Aba "PIXELS"

### **PRIORIDADE MÉDIA:**
3. **Integrations** - Aba "INTEGRAÇÕES"
4. **Domains** - Aba "DOMÍNIO"
5. **Shipping** - Relacionado a produtos

### **PRIORIDADE BAIXA:**
6. **Social Proof** - Usado no checkout
7. **Theme/Checkout** - Configurações de tema

---

## 📝 NOTAS IMPORTANTES

1. **Rota Orderbump:** O frontend chama `/products/:productId/order-bumps` (sem `/api`), mas deve ser `/api/products/:productId/order-bumps` ou criar rota separada `/api/orderbumps`.

2. **Rota Pixels:** O frontend chama `/pixels/:productId` (sem `/api`), precisa ajustar para `/api/pixels/:productId` ou criar rota separada.

3. **Social Proof:** Usa prefixo `/theme/:productId/social-proofs`, precisa decidir se cria rota `/api/theme/` ou `/api/products/:productId/social-proofs`.

4. **Upload de imagens:** Orderbumps e Social Proof usam `multipart/form-data`, precisa implementar `multer` similar ao upload de produtos.

---

## 🚀 PRÓXIMOS PASSOS

1. Implementar rotas de **Orderbumps** (prioridade alta)
2. Implementar rotas de **Pixels** (prioridade alta)
3. Ajustar rotas no frontend para incluir `/api` onde necessário
4. Implementar rotas restantes conforme prioridade


