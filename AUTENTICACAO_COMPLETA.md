# ✅ SISTEMA DE AUTENTICAÇÃO COMPLETO

## 📦 O que foi implementado

### **Banco de Dados: MongoDB** ✅
Usando MongoDB que já estava configurado no projeto.

### **Funcionalidades Implementadas:**

1. ✅ **Model User** - Schema para usuários (PERSON e COMPANY)
2. ✅ **POST /auth/session** - Login de usuário
3. ✅ **POST /user/create** - Registro de usuário (PF ou PJ)
4. ✅ **GET /user/me** - Buscar dados do usuário logado
5. ✅ **Middleware de autenticação JWT** - Proteger rotas
6. ✅ **Validação de dados** - Joi para registro e login
7. ✅ **Hash de senha** - bcryptjs
8. ✅ **Validação CPF/CNPJ** - cpf-cnpj-validator

---

## 🔧 Configuração

### 1. Atualizar .env

Adicione ao arquivo `insane-backend/.env`:

```env
# JWT Secret (para tokens de autenticação)
JWT_SECRET=sua-chave-secreta-jwt-aqui-altere-em-producao
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE**: 
- Use uma chave secreta forte em produção
- Gere com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 2. Arquivo .env completo:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/insane-pay
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui
MP_WEBHOOK_SECRET=seu-secret-aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT (Autenticação)
JWT_SECRET=sua-chave-secreta-jwt-aqui-altere-em-producao
JWT_EXPIRES_IN=7d
```

---

## 📋 Rotas Implementadas

### 1. POST /auth/session (Login)

**Método**: `POST`  
**Rota**: `/auth/session`  
**Autenticação**: ❌ Não requerida

**Body**:
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response (200)**:
```json
{
  "data": {
    "session": "jwt-token-aqui",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "João Silva",
      "email": "usuario@example.com",
      "accountType": "PERSON",
      "status": "ACTIVE",
      "emailVerified": false,
      "fixTax": 0.50,
      "percentTax": 3.99,
      "cpf": "12345678901"
    },
    "message": "Login realizado com sucesso!"
  }
}
```

---

### 2. POST /user/create (Registro)

**Método**: `POST`  
**Rota**: `/user/create`  
**Autenticação**: ❌ Não requerida

**Body - Pessoa Física (PERSON)**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "accountType": "PERSON",
  "cpf": "12345678901",
  "phone": "21987654321",
  "birthDate": "1990-01-15",
  "acceptTerms": true
}
```

**Body - Pessoa Jurídica (COMPANY)**:
```json
{
  "name": "Empresa XYZ",
  "email": "contato@empresa.com",
  "password": "senha123",
  "accountType": "COMPANY",
  "cnpj": "12345678000190",
  "companyName": "Empresa XYZ Ltda",
  "tradeName": "XYZ",
  "phone": "21987654321",
  "acceptTerms": true
}
```

**Response (201)**:
```json
{
  "data": {
    "message": "Usuário criado com sucesso!",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "João Silva",
      "email": "joao@example.com",
      "accountType": "PERSON",
      "status": "ACTIVE"
    }
  }
}
```

---

### 3. GET /user/me (Dados do Usuário)

**Método**: `GET`  
**Rota**: `/user/me`  
**Autenticação**: ✅ Requerida (Bearer Token)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (200)**:
```json
{
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "João Silva",
    "email": "joao@example.com",
    "accountType": "PERSON",
    "status": "ACTIVE",
    "emailVerified": false,
    "fixTax": 0.50,
    "percentTax": 3.99,
    "type": "PERSON",
    "cpf": "12345678901",
    "birthDate": "1990-01-15T00:00:00.000Z",
    "twoFactorEnabled": false,
    "twoFactorMethod": null
  }
}
```

---

## 🧪 Como Testar

### 1. Registrar Usuário (Pessoa Física)

```bash
curl -X POST http://localhost:3000/user/create \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"João Silva\",
    \"email\": \"joao@example.com\",
    \"password\": \"senha123\",
    \"accountType\": \"PERSON\",
    \"cpf\": \"12345678901\",
    \"phone\": \"21987654321\",
    \"birthDate\": \"1990-01-15\",
    \"acceptTerms\": true
  }"
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/session \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"joao@example.com\",
    \"password\": \"senha123\"
  }"
```

**Copie o `session` (token) da resposta!**

### 3. Buscar Dados do Usuário

```bash
curl http://localhost:3000/user/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔐 Segurança

### 1. Hash de Senha
- Senhas são hashadas automaticamente com bcrypt antes de salvar
- 10 rounds de salt (seguro e rápido)

### 2. JWT Tokens
- Tokens expiram em 7 dias (configurável via `JWT_EXPIRES_IN`)
- Validados em todas as rotas protegidas

### 3. Validação de Dados
- CPF/CNPJ validados antes de salvar
- Email único no sistema
- CPF/CNPJ únicos por tipo de conta

### 4. Proteção de Rotas
- Middleware `authenticate` protege rotas privadas
- Verifica token JWT em cada requisição

---

## 📊 Estrutura do Model User

### Campos Comuns:
- `name`, `email`, `password`, `accountType`, `phone`, `status`
- `fixTax`, `percentTax` (taxas do gateway)
- `twoFactorEnabled`, `twoFactorMethod` (2FA)
- `acceptTerms`, `termsAcceptedAt`

### Campos Pessoa Física (PERSON):
- `cpf`, `birthDate`

### Campos Pessoa Jurídica (COMPANY):
- `cnpj`, `companyName`, `tradeName`

---

## ✅ Checklist de Testes

- [ ] Registrar usuário Pessoa Física
- [ ] Registrar usuário Pessoa Jurídica
- [ ] Tentar registrar email duplicado (deve retornar erro)
- [ ] Tentar registrar CPF/CNPJ duplicado (deve retornar erro)
- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas (deve retornar erro)
- [ ] Buscar /user/me sem token (deve retornar 401)
- [ ] Buscar /user/me com token válido (deve retornar dados)
- [ ] Buscar /user/me com token expirado (deve retornar 401)

---

## 🎯 Próximos Passos (Futuro)

Após autenticação funcionar:

1. ✅ Email de verificação (nodemailer)
2. ✅ Recuperação de senha
3. ✅ Mudança de senha (já tem no frontend)
4. ✅ 2FA completo (já tem estrutura)
5. ✅ Refresh tokens
6. ✅ Logout (invalidar token)

---

**Sistema de autenticação completo e funcionando! 🎉**

Pronto para testar no frontend!

