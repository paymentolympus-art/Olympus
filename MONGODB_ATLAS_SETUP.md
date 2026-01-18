# 🚀 MONGODB ATLAS - GUIA RÁPIDO

## ✅ O QUE VOCÊ PRECISA FAZER

### **PASSO 1: Aguardar Cluster Ficar Pronto** ⏳

No dashboard do Atlas, aguarde até ver:
- ✅ Status do cluster: **"Active"** (verde)
- ✅ Sem mensagem "Estamos implementando suas alterações"

---

### **PASSO 2: Criar Usuário do Banco** 👤

1. Clique em **"SEGURANÇA"** no menu lateral → **"Database Access"**
2. Clique em **"+ Adicionar novo usuário do banco de dados"**
3. Preencha:
   - **Nome de usuário**: `insane-pay-admin` (ou outro)
   - **Senha**: Clique em **"Gerar senha segura"** → **COPIE A SENHA**
   - **Privilégios**: Selecione **"Atlas admin"**
4. Clique em **"Adicionar usuário"**

**⚠️ ANOTE: Usuário = `???` | Senha = `???`**

---

### **PASSO 3: Configurar Whitelist de IP** 🌐

1. Clique em **"SEGURANÇA"** → **"Network Access"**
2. Clique em **"+ Adicionar endereço IP"**
3. **Opção Rápida**: Clique em **"Permitir acesso de qualquer lugar"** → Digite `0.0.0.0/0` → **"Confirmar"**
4. ⚠️ Aguarde alguns segundos para ativar

---

### **PASSO 4: Obter String de Conexão** 🔗

1. Clique no botão **"Conectar"** no Cluster0
2. Selecione **"Conectar seu aplicativo"**
3. **Driver**: `Node.js`
4. **Versão**: `5.5 ou posterior`
5. **COPIE A STRING** que aparece:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### **PASSO 5: Substituir Credenciais** ✏️

Na string copiada, substitua:
- `<username>` → O usuário que criou (ex: `insane-pay-admin`)
- `<password>` → A senha que você copiou

**Exemplo:**
```
mongodb+srv://insane-pay-admin:MinhaSenh@123@cluster0.abc123.mongodb.net/insane-pay?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE:**
- Se a senha tiver caracteres especiais (`@`, `#`, `$`, etc), eles precisam ser codificados:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

**OU use o script auxiliar:**
```bash
node scripts/format-connection-string.js
```

---

### **PASSO 6: Adicionar Nome do Banco** 📊

**Adicione `/insane-pay`** antes do `?` na string:

**Antes:**
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Depois:**
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/insane-pay?retryWrites=true&w=majority
                                                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
```

---

## 📤 **O QUE VOCÊ PRECISA ME ENVIAR**

### **Opção 1: String Completa (Mais Fácil)** ✅

Envie a string de conexão completa, já com usuário e senha substituídos:

```
mongodb+srv://insane-pay-admin:MinhaSenh@123@cluster0.abc123.mongodb.net/insane-pay?retryWrites=true&w=majority
```

---

### **Opção 2: Dados Separados** 📝

Me envie:
1. **Usuário**: `???`
2. **Senha**: `???`
3. **Cluster URL**: `cluster0.xxxxx.mongodb.net` (da string)

**Então eu crio a string para você!**

---

## ⚙️ **O QUE EU VOU FAZER**

1. ✅ Atualizar o arquivo `.env` com a string de conexão
2. ✅ Testar a conexão
3. ✅ Verificar se está tudo funcionando
4. ✅ Pronto para usar!

---

## 🧪 **TESTE RÁPIDO APÓS CONFIGURAR**

```bash
cd insane-backend
npm run dev
```

**Você deve ver:**
```
✅ MongoDB conectado com sucesso!
   Database: insane-pay
```

---

## ❓ **PERGUNTAS FREQUENTES**

### **Como saber se o cluster está pronto?**
- Status verde ✅ no dashboard
- Sem mensagem "implementando alterações"

### **Senha com caracteres especiais?**
- Use o script `format-connection-string.js`
- OU codifique manualmente: `@` → `%40`, etc.

### **Erro ao conectar?**
1. Verifique se o IP está na whitelist
2. Verifique usuário e senha
3. Aguarde alguns segundos após adicionar IP

---

**🎯 Pronto! Aguardando seus dados para configurar tudo automaticamente!**

