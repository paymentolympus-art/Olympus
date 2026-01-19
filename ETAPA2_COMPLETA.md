# ✅ ETAPA 2 COMPLETA - GET /orders/:orderId/status

## 📦 O que foi implementado

### Nova Funcionalidade

**GET `/api/orders/:orderId/status`** - Consultar status de um pedido

### Arquivos Atualizados

1. **`src/controllers/orderController.js`**
   - ✅ Adicionada função `getOrderStatus`
   - ✅ Lógica completa de consulta ao Mercado Pago
   - ✅ Otimização para polling frequente

2. **`src/routes/orderRoutes.js`**
   - ✅ Adicionada rota `GET /:orderId/status`
   - ✅ Documentação completa da rota

3. **`src/models/Order.js`**
   - ✅ Já tinha todos os campos necessários (`mercadoPagoPaymentId`, `status`, `pix.expiresAt`)

## 🔄 Fluxo Completo da Função

### Passo a Passo

```
1. Recebe orderId nos parâmetros da URL
   ↓
2. Valida se orderId é um ObjectId válido do MongoDB
   ↓
3. Busca Order no MongoDB pelo _id
   ↓
4. Se não encontrado → Retorna 404
   ↓
5. Se status já for PAID ou EXPIRED:
   → Retorna imediatamente SEM consultar Mercado Pago
   (otimização para polling frequente)
   ↓
6. Se status for PENDING:
   → Verifica se QR Code expirou (pela data)
   → Se expirado → Marca como EXPIRED e retorna
   ↓
7. Consulta status no Mercado Pago usando:
   mercadopago.payment.get(mpPaymentId)
   ↓
8. Mapeia status do MP para status do Order:
   - 'approved' → 'PAID'
   - 'rejected' ou 'cancelled' → 'EXPIRED'
   - 'pending' → Mantém 'PENDING' (ou verifica expiração)
   - 'refunded' → 'EXPIRED'
   ↓
9. Atualiza Order no MongoDB se status mudou
   ↓
10. Retorna status atualizado
```

## 📋 Mapeamento de Status

### Mercado Pago → Order

| Status MP | Status Order | Ação |
|-----------|--------------|------|
| `approved` | `PAID` | Atualiza Order, salva `paidAt` |
| `rejected` | `EXPIRED` | Atualiza Order |
| `cancelled` | `EXPIRED` | Atualiza Order |
| `pending` | `PENDING` | Mantém (ou verifica se expirou) |
| `refunded` | `EXPIRED` | Atualiza Order |

## 🚀 Como Testar

### 1. Criar um Pedido (para ter um orderId)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.90,
    "description": "Teste de status",
    "payerEmail": "cliente@example.com"
  }'
```

**Response:**
```json
{
  "data": {
    "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "PENDING",
    ...
  }
}
```

### 2. Consultar Status do Pedido

**Substitua `65a1b2c3d4e5f6g7h8i9j0k1` pelo orderId real:**

```bash
curl http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1/status
```

**Response (PENDING):**
```json
{
  "status": "PENDING",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "message": "Pagamento pendente"
}
```

**Response (PAID):**
```json
{
  "status": "PAID",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:30:00.000Z",
  "message": "Pagamento aprovado!"
}
```

**Response (EXPIRED):**
```json
{
  "status": "EXPIRED",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:30:00.000Z",
  "message": "Pagamento expirado"
}
```

**Response (404 - Não encontrado):**
```json
{
  "error": "Pedido não encontrado",
  "message": "Pedido com ID 65a1b2c3d4e5f6g7h8i9j0k1 não foi encontrado"
}
```

## 🧪 Testando com Postman

### 1. Criar Pedido

1. **Método**: `POST`
2. **URL**: `http://localhost:3000/api/orders`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "amount": 99.90,
     "description": "Teste de status",
     "payerEmail": "cliente@example.com"
   }
   ```
5. **Send** → Copie o `orderId` da resposta

### 2. Consultar Status

1. **Método**: `GET`
2. **URL**: `http://localhost:3000/api/orders/{{orderId}}/status`
   - Substitua `{{orderId}}` pelo ID copiado anteriormente
   - Exemplo: `http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1/status`
3. **Headers**: Nenhum necessário
4. **Send** → Veja o status retornado

### 3. Simular Polling

1. **Coleção no Postman**: Crie uma coleção
2. **Variável**: Crie variável `orderId` na coleção
3. **Request de Status**: Configure para usar `{{orderId}}`
4. **Runner**: Use Runner para executar múltiplas vezes (simulando polling)

## ⚡ Otimizações Implementadas

### 1. Retorno Imediato para Status Finais

Se o Order já está `PAID` ou `EXPIRED`, retorna imediatamente **SEM** consultar Mercado Pago.

**Benefício**: Reduz chamadas desnecessárias ao MP durante polling frequente.

### 2. Verificação de Expiração Local

Antes de consultar MP, verifica se o QR Code expirou pela data (`pix.expiresAt`).

**Benefício**: Marca como EXPIRED sem precisar consultar MP.

### 3. Tratamento de Erros no MP

Se houver erro ao consultar MP, retorna status local em vez de falhar completamente.

**Benefício**: Polling continua funcionando mesmo se MP estiver temporariamente indisponível.

### 4. Atualização Condicional

Apenas atualiza Order se o status realmente mudou.

**Benefício**: Reduz escritas desnecessárias no banco.

## 📊 Exemplos de Respostas

### Pedido Pendente (Primeira Consulta)

```json
{
  "status": "PENDING",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "message": "Pagamento pendente"
}
```

### Pedido Pago (Após Pagamento)

```json
{
  "status": "PAID",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:15:30.000Z",
  "message": "Pagamento aprovado!"
}
```

### Pedido Expirado

```json
{
  "status": "EXPIRED",
  "orderId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 99.90,
  "updatedAt": "2024-01-01T12:30:00.000Z",
  "message": "Pagamento expirado"
}
```

### Pedido Não Encontrado (404)

```json
{
  "error": "Pedido não encontrado",
  "message": "Pedido com ID 65a1b2c3d4e5f6g7h8i9j0k1 não foi encontrado"
}
```

### ID Inválido (400)

```json
{
  "error": "ID inválido",
  "message": "Formato de ID inválido"
}
```

## 🔍 Verificar no MongoDB

Após consultar status, você pode verificar se o Order foi atualizado:

```javascript
// MongoDB Shell ou Compass
db.orders.findOne({ _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

// Ver campos atualizados:
// - status: "PAID" | "PENDING" | "EXPIRED"
// - mercadoPagoStatus: "approved" | "pending" | etc.
// - paidAt: Date (se foi pago)
// - updatedAt: Date (última atualização)
```

## ✅ Checklist de Testes

- [ ] Consultar pedido existente (deve retornar status)
- [ ] Consultar pedido inexistente (deve retornar 404)
- [ ] Consultar com ID inválido (deve retornar 400)
- [ ] Consultar pedido PENDING (deve consultar MP)
- [ ] Consultar pedido PAID (não deve consultar MP)
- [ ] Consultar pedido EXPIRED (não deve consultar MP)
- [ ] Pagar pedido no Mercado Pago e consultar status (deve atualizar para PAID)
- [ ] Aguardar expiração do QR Code e consultar (deve atualizar para EXPIRED)

## 🎯 Integração com Frontend

O frontend pode usar esta rota para polling:

```javascript
// Exemplo de polling no frontend
const checkOrderStatus = async (orderId) => {
  const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`);
  const data = await response.json();
  
  if (data.status === 'PAID') {
    // Pagamento confirmado!
    stopPolling();
    showSuccess();
  } else if (data.status === 'EXPIRED') {
    // Pagamento expirado
    stopPolling();
    showExpired();
  } else {
    // Ainda pendente, continua polling
    setTimeout(() => checkOrderStatus(orderId), 5000); // A cada 5 segundos
  }
};

// Iniciar polling após criar pedido
checkOrderStatus(orderId);
```

## 🐛 Troubleshooting

### Erro: "Pedido não encontrado"

**Problema**: OrderId não existe no banco.

**Solução**: Verifique se o ID está correto e se o pedido foi criado.

### Erro: "Formato de ID inválido"

**Problema**: OrderId não é um ObjectId válido.

**Solução**: Certifique-se de usar o ID retornado pelo POST /orders.

### Status não atualiza para PAID

**Problema**: Mercado Pago não foi consultado ou pagamento não foi aprovado.

**Solução**: 
1. Verifique se `mercadoPagoPaymentId` está salvo no Order
2. Verifique se o token do MP está correto
3. Verifique logs do servidor

### Erro ao consultar Mercado Pago

**Problema**: Token inválido ou MP temporariamente indisponível.

**Solução**: 
1. Verifique `MERCADOPAGO_ACCESS_TOKEN` no `.env`
2. Verifique se está usando token TEST ou PRODUCTION corretamente
3. A função retorna status local em caso de erro (não falha completamente)

## 📚 Próximos Passos

Agora que a Etapa 2 está completa, podemos implementar:

### Etapa 3: POST /webhooks/pix/payment
- Receber webhook do Mercado Pago
- Atualizar status automaticamente
- Disparar ações (criar Sale, enviar email, etc.)
- Mais eficiente que polling constante

---

**Etapa 2 concluída com sucesso! 🎉**

Pronto para continuar com a Etapa 3 (Webhook)?


