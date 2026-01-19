# ✅ ETAPA 3 COMPLETA - POST /webhooks/pix/payment

## 📦 O que foi implementado

### Nova Funcionalidade

**POST `/webhooks/pix/payment`** - Receber webhooks do Mercado Pago (notificações automáticas de pagamento)

### Arquivos Criados/Atualizados

1. **`src/models/Sale.js`** ✅ NOVO
   - Schema Mongoose para vendas finalizadas
   - Campos: orderId, userId, amount, mercadoPagoPaymentId, status, paidAt
   - Criado quando pagamento é aprovado

2. **`src/controllers/webhookController.js`** ✅ NOVO
   - Função `handlePixWebhook` completa
   - Validação de assinatura HMAC-SHA256
   - Processamento idempotente
   - Criação automática de Sale

3. **`src/routes/webhookRoutes.js`** ✅ NOVO
   - Rota POST `/webhooks/pix/payment`
   - Rota alternativa POST `/webhooks/payments`

4. **`src/models/Order.js`** ✅ ATUALIZADO
   - Adicionado `webhookProcessed: boolean` (idempotência)
   - Adicionado `webhookId: number` (evita duplicatas)

5. **`src/app.js`** ✅ ATUALIZADO
   - Adicionada rota `/webhooks`

6. **`.env.example`** ✅ ATUALIZADO
   - Adicionado `MP_WEBHOOK_SECRET`

## 🔐 Segurança: Validação de Assinatura

### Como Funciona

O Mercado Pago envia um header `x-signature` com uma assinatura HMAC-SHA256:

```
x-signature: ts=1234567890,v1=abc123def456...
```

A validação:
1. Extrai `ts` (timestamp) e `v1` (hash) do signature
2. Extrai `x-request-id` do header
3. Extrai `id` do body
4. Cria manifest: `id:xxx;request-id:xxx;ts:xxx;`
5. Calcula HMAC-SHA256 usando `MP_WEBHOOK_SECRET`
6. Compara com `v1` recebido

**Se não bater → Webhook rejeitado (possível fraude)**

## 🔄 Fluxo Completo da Função

```
1. Webhook recebido do Mercado Pago
   ↓
2. Responder 200 OK IMEDIATAMENTE (<5s)
   (MP reenvia se demorar muito)
   ↓
3. Validar assinatura HMAC (segurança)
   → Se inválida, rejeita e retorna
   ↓
4. Verificar tipo e action
   → Apenas processa 'payment' com action 'payment.updated'
   ↓
5. Buscar Order pelo mpPaymentId
   → Se não encontrar, retorna silenciosamente (idempotência)
   ↓
6. Verificar idempotência
   → Se já processado, ignora
   → Se Order já está PAID, ignora
   ↓
7. Consultar status no Mercado Pago
   → mercadopago.payment.get(mpPaymentId)
   ↓
8. Processar conforme status:
   
   Se 'approved':
   → Atualiza Order para PAID
   → Cria Sale (venda finalizada)
   → Dispara integrações (logs por enquanto)
   
   Se 'rejected' ou 'cancelled':
   → Atualiza Order para EXPIRED
   
   Outros:
   → Atualiza apenas mercadoPagoStatus
   ↓
9. Marcar webhook como processado
   → webhookProcessed = true
   → webhookId = body.id
```

## 📋 Configuração do Webhook no Mercado Pago

### Passo a Passo

1. **Acesse o Dashboard do Mercado Pago**
   - URL: https://www.mercadopago.com.br/developers/panel/app
   - Faça login na sua conta

2. **Selecione sua Aplicação**
   - Se não tiver, crie uma nova aplicação

3. **Vá em "Webhooks"**
   - Menu lateral > "Webhooks" ou "Suas integrações" > "Webhooks"

4. **Configure o Webhook**
   - **URL**: `https://seu-dominio.com/webhooks/pix/payment`
     - Para desenvolvimento local, use ngrok (veja abaixo)
   - **Eventos**: Selecione `Payments` (ou `Pagamentos`)
   - **Versão da API**: Use a mais recente

5. **Copie o Secret Key**
   - Em "Credenciais" ou "Secret key"
   - Cole no `.env` como `MP_WEBHOOK_SECRET`

### Para Desenvolvimento Local (ngrok)

1. **Instale o ngrok**: https://ngrok.com/download

2. **Inicie seu servidor local**:
   ```bash
   npm run dev
   ```

3. **Exponha localhost**:
   ```bash
   ngrok http 3000
   ```

4. **Copie a URL HTTPS**:
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Configure webhook no MP**:
   - URL: `https://abc123.ngrok.io/webhooks/pix/payment`
   - Eventos: `Payments`

6. **Teste**: Use a ferramenta "Testar webhook" no dashboard do MP

## 🧪 Como Testar

### 1. Usando Ferramenta "Testar Webhook" do MP

1. Acesse o dashboard do MP
2. Vá em "Webhooks" > Sua configuração
3. Clique em "Testar webhook"
4. Selecione evento: `payment.updated`
5. Status: `approved`
6. Clique em "Enviar teste"

**O que acontece:**
- MP envia webhook para sua URL configurada
- Seu backend recebe e processa
- Verifique logs do servidor

### 2. Usando cURL (Simular Webhook)

```bash
curl -X POST http://localhost:3000/webhooks/pix/payment \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123" \
  -H "x-request-id: test-123" \
  -d '{
    "id": 123456,
    "live_mode": false,
    "type": "payment",
    "action": "payment.updated",
    "data": {
      "id": "123456789"
    }
  }'
```

**⚠️ Nota**: A assinatura será inválida (é apenas exemplo). Para teste real, use o dashboard do MP.

### 3. Testando com Pagamento Real (Sandbox)

1. **Configure webhook** (veja acima)
2. **Crie um pedido**:
   ```bash
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 99.90,
       "payerEmail": "test_user_123@testuser.com",
       "description": "Teste webhook"
     }'
   ```
3. **Copie o `pixCode`** da resposta
4. **Pague no Mercado Pago Sandbox**:
   - Use conta sandbox
   - Escaneie QR Code ou use código PIX
   - Confirme pagamento
5. **MP enviará webhook automaticamente**
6. **Verifique logs do servidor**

## 📊 Exemplo de Webhook Recebido

### Headers
```
Content-Type: application/json
x-signature: ts=1704110400,v1=a1b2c3d4e5f6...
x-request-id: 550e8400-e29b-41d4-a716-446655440000
```

### Body
```json
{
  "id": 123456789,
  "live_mode": false,
  "type": "payment",
  "date_created": "2024-01-01T12:00:00.000Z",
  "user_id": 123456789,
  "api_version": "v1",
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```

## ✅ O que Acontece ao Processar Webhook

### Quando Status = 'approved':

1. ✅ Order atualizado:
   - `status` → `PAID`
   - `paidAt` → Data atual
   - `webhookProcessed` → `true`
   - `webhookId` → ID do webhook

2. ✅ Sale criada:
   - Nova entrada na collection `sales`
   - `orderId` → ID do Order
   - `amount` → Valor da venda
   - `mercadoPagoPaymentId` → ID do pagamento
   - `status` → `COMPLETED`

3. ✅ Integrações disparadas:
   - Logs no console (por enquanto)
   - Futuro: email, estoque, webhooks externos

### Logs Esperados:

```
📨 Webhook recebido do Mercado Pago
   Type: payment
   Action: payment.updated
   ID: 123456789
✅ Assinatura do webhook válida
💳 Processando pagamento ID: 123456789
📦 Order encontrado: 65a1b2c3d4e5f6g7h8i9j0k1, Status atual: PENDING
🔍 Consultando status no Mercado Pago para paymentId: 123456789
📊 Status no Mercado Pago: approved
✅ Pagamento aprovado! Processando Order 65a1b2c3d4e5f6g7h8i9j0k1...
💾 Order 65a1b2c3d4e5f6g7h8i9j0k1 atualizado para PAID
💰 Sale criada: 65a1b2c3d4e5f6g7h8i9j0k2 para Order 65a1b2c3d4e5f6g7h8i9j0k1
🚀 Disparando integrações...
   📧 Email de confirmação (futuro: nodemailer)
   📦 Atualização de estoque (futuro: integração)
   🔗 Webhooks de integração (futuro: UTMify, etc.)
✅ Webhook processado com sucesso: 123456789
```

## 🔍 Verificar no MongoDB

Após processar webhook, verifique:

### Order Atualizado:
```javascript
db.orders.findOne({ _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

// Campos atualizados:
// - status: "PAID"
// - paidAt: ISODate("2024-01-01T12:30:00.000Z")
// - webhookProcessed: true
// - webhookId: 123456789
// - mercadoPagoStatus: "approved"
```

### Sale Criada:
```javascript
db.sales.findOne({ orderId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") })

// Campos:
// - orderId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1")
// - amount: 99.90
// - mercadoPagoPaymentId: 123456789
// - status: "COMPLETED"
// - paidAt: ISODate("2024-01-01T12:30:00.000Z")
```

## ⚡ Otimizações e Boas Práticas

### 1. Idempotência

- Verifica `webhookProcessed` e `webhookId`
- Evita processar o mesmo webhook duas vezes
- Importante porque MP pode reenviar

### 2. Resposta Rápida

- Responde 200 OK imediatamente
- Processa assincronamente após resposta
- Evita timeout do MP (<5s)

### 3. Tratamento de Erros

- Nunca retorna 500 (MP reenvia, causa loop)
- Sempre captura e loga erros
- Processamento continua mesmo com erros parciais

### 4. Validação de Segurança

- Valida assinatura HMAC antes de processar
- Rejeita webhooks não autenticados
- Protege contra fraudes

## 🐛 Troubleshooting

### Webhook não está sendo recebido

**Problema**: URL não está acessível ou incorreta.

**Solução**:
1. Verifique se servidor está rodando
2. Para local, use ngrok
3. Verifique URL no dashboard do MP
4. Teste com "Testar webhook" do MP

### Assinatura inválida

**Problema**: `MP_WEBHOOK_SECRET` incorreto ou não configurado.

**Solução**:
1. Verifique `.env` tem `MP_WEBHOOK_SECRET`
2. Confirme que é o secret correto do dashboard
3. Verifique logs para ver assinatura calculada vs recebida

### Webhook processado múltiplas vezes

**Problema**: Idempotência não está funcionando.

**Solução**:
1. Verifique se `webhookProcessed` está sendo salvo
2. Confirme que `webhookId` está sendo comparado
3. Verifique logs para duplicatas

### Sale não está sendo criada

**Problema**: Erro ao criar Sale ou Order não encontrado.

**Solução**:
1. Verifique logs para erros
2. Confirme que `mpPaymentId` está correto no Order
3. Verifique se pagamento foi realmente aprovado no MP

### Erro ao consultar Mercado Pago

**Problema**: Token inválido ou MP indisponível.

**Solução**:
1. Verifique `MERCADOPAGO_ACCESS_TOKEN` no `.env`
2. Confirme que token é válido
3. Verifique logs para erros específicos

## 📚 Próximos Passos

### Features Extras (Opcionais):

1. **Email de Confirmação**
   - Usar nodemailer
   - Enviar email quando pagamento for aprovado

2. **Cancelamento/Reembolso**
   - Rota para cancelar pedido
   - Integração com MP para reembolso

3. **Fila de Processamento**
   - Usar Bull ou BullMQ
   - Processar webhooks em background
   - Retry automático

4. **Notificações Push**
   - WebSockets ou Server-Sent Events
   - Notificar frontend em tempo real

5. **Relatórios e Analytics**
   - Dashboard de vendas
   - Gráficos de conversão
   - Relatórios de pagamentos

6. **Integrações Externas**
   - Webhooks para UTMify
   - Integração com CRM
   - Atualização de estoque

---

**Etapa 3 concluída com sucesso! 🎉**

## 🎯 Status do Projeto

### ✅ Implementado:

1. ✅ **Etapa 1**: POST /orders (criar pedido e gerar PIX)
2. ✅ **Etapa 2**: GET /orders/:id/status (consultar status)
3. ✅ **Etapa 3**: POST /webhooks/pix/payment (receber webhooks)

### 🎉 Funcionalidades Completas:

- ✅ Criar pedido e gerar QR Code PIX
- ✅ Consultar status do pedido (polling)
- ✅ Receber webhooks automáticos do Mercado Pago
- ✅ Atualizar status automaticamente quando pago
- ✅ Criar registro de venda (Sale) quando confirmado
- ✅ Validação de segurança (assinatura HMAC)
- ✅ Idempotência (evita duplicatas)
- ✅ Tratamento de erros robusto

**O gateway de pagamentos PIX está FUNCIONAL e PRONTO PARA USO!** 🚀

---

Quer adicionar alguma feature extra ou o projeto está completo?


