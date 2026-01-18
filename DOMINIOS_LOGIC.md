# 📋 LÓGICA COMPLETA DE DOMÍNIOS

## 🎯 COMO FUNCIONA

### **1. Conceito:**
- Domínios permitem criar URLs personalizadas para checkout
- Cada domínio tem um subdomínio padrão: `pay.dominio.com`
- Produtos podem ser associados a domínios
- Um produto pode ter apenas **um domínio** vinculado

### **2. Estrutura de CNAME:**
- **Tipo:** CNAME (sempre)
- **Nome:** `pay` (sempre)
- **Valor:** URL do servidor de checkout (configurável)
- **URL gerada:** `https://pay.exemplo.com/oferta-slug`

### **3. Status dos Domínios:**
- **PENDING:** Domínio criado, mas CNAME não configurado/verificado
- **VERIFIED:** CNAME configurado corretamente e verificado
- **ERROR:** Erro na verificação do CNAME

---

## 📡 ROTAS NECESSÁRIAS

### **CRUD de Domínios:**
1. `GET /api/domains` - Listar domínios (com filtros e paginação)
2. `GET /api/domains/:id` - Buscar domínio por ID
3. `POST /api/domains` - Criar domínio
4. `PUT /api/domains/:id` - Atualizar domínio
5. `DELETE /api/domains/:id` - Deletar domínio
6. `POST /api/domains/:id/verify` - Verificar domínio (consultar DNS)

### **Associação Domínio-Produto:**
7. `GET /api/domains/product/:productId` - Listar domínios de um produto
8. `POST /api/domains/:domainId/associate-products` - Associar produtos em massa
9. `POST /api/domains/:domainId/add-product` - Adicionar produto individual
10. `DELETE /api/domains/:domainId/remove-product` - Remover produto

---

## 🔧 COMO FUNCIONA O APONTAMENTO

### **1. Criação do Domínio:**
```
Usuário cria: exemplo.com
Sistema gera:
  - cnameType: "CNAME"
  - cnameName: "pay"
  - cnameValue: "checkout.insanepay.com.br" (ou configurável)
```

### **2. Instruções para o Usuário:**
```
No DNS do domínio (exemplo.com), criar:
  Tipo: CNAME
  Nome: pay
  Valor: checkout.insanepay.com.br
```

### **3. Verificação:**
```
Sistema consulta DNS para verificar se:
  pay.exemplo.com → aponta para checkout.insanepay.com.br
```

### **4. URLs Geradas:**
```
Produto com oferta "produto-xyz" + domínio "exemplo.com":
  URL: https://pay.exemplo.com/produto-xyz
```

---

## 📊 ESTRUTURA DE DADOS

### **Domain:**
```javascript
{
  id: string;
  name: string; // "exemplo.com"
  status: "PENDING" | "VERIFIED" | "ERROR";
  cnameType: "CNAME";
  cnameName: "pay";
  cnameValue: string; // "checkout.insanepay.com.br"
  userId: string;
  productDomain: ProductDomain[];
  createdAt: string;
  updatedAt: string;
}
```

### **ProductDomain (Tabela de Relacionamento):**
```javascript
{
  id: string;
  productId: string;
  domainId: string;
  createdAt: string;
}
```

---

## 🔐 VERIFICAÇÃO DNS

### **Como verificar:**
1. Consultar DNS do subdomínio: `pay.exemplo.com`
2. Verificar se retorna CNAME para `checkout.insanepay.com.br`
3. Atualizar status:
   - ✅ CNAME correto → `VERIFIED`
   - ❌ CNAME incorreto/inexistente → `ERROR`
   - ⏳ Não verificado ainda → `PENDING`

### **Biblioteca Node.js para DNS:**
```javascript
import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);
```

---

## 🌐 COMO É SERVIDO

### **No Frontend (Checkout):**
- Quando produto tem domínio, usa a URL do domínio
- Exemplo: `https://pay.exemplo.com/oferta-slug`
- Se não tiver domínio, usa URL padrão do sistema

### **No Backend:**
- Domínios são apenas configuração
- O servidor precisa estar configurado para aceitar requisições de múltiplos domínios
- Nginx/Apache/Cloudflare precisam ter configuração de wildcard SSL

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Model Domain criado
- [ ] Model ProductDomain criado
- [ ] Controller Domain criado (10 funções)
- [ ] Rotas de domínios criadas
- [ ] Validação de nome de domínio
- [ ] Verificação DNS implementada
- [ ] Autenticação nas rotas
- [ ] Rotas registradas no app.js
- [ ] Frontend atualizado para incluir `/api`

---

## 📝 NOTAS IMPORTANTES

1. **CNAME Padrão:** Sempre `pay.dominio.com` (cnameName: "pay")
2. **Valor do CNAME:** Configurável (ex: `checkout.insanepay.com.br`)
3. **Produto x Domínio:** Relação 1:N (um produto pode ter apenas 1 domínio)
4. **Domínio x Produto:** Relação 1:N (um domínio pode ter vários produtos)
5. **Verificação DNS:** Consulta assíncrona, não bloqueia criação

