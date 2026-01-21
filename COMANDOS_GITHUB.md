# 🔗 Comandos para Conectar ao GitHub

## ✅ Git já inicializado e commitado!

O repositório local está pronto. Agora siga estes passos:

---

## 📋 Passo 1: Criar Repositório no GitHub

### Opção A: Via Web (Mais Fácil)

1. Acesse: **https://github.com/new**
2. Faça login na sua conta
3. Preencha:
   - **Repository name:** `insane-backend` (ou outro nome)
   - **Description:** `Backend do gateway de pagamentos PIX`
   - **Visibility:** Escolha **Public** ou **Private**
   - ⚠️ **NÃO marque** "Add a README file" (já temos)
   - ⚠️ **NÃO adicione** .gitignore ou license (já temos)
4. Clique em **"Create repository"**

### Opção B: Via GitHub CLI (Se tiver instalado)

```bash
gh repo create insane-backend --public --source=. --remote=origin --push
```

---

## 📋 Passo 2: Conectar Repositório Local ao GitHub

Após criar o repositório no GitHub, você verá uma página com instruções.

### 2.1 Copiar URL do Repositório

Você verá algo como:
```
https://github.com/SEU-USUARIO/insane-backend.git
```

### 2.2 Executar Estes Comandos

```bash
# Navegar para a pasta do projeto (se não estiver)
cd C:\Users\umdoi\Downloads\Testando\insane-backend

# Adicionar remote (SUBSTITUA pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/insane-backend.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

⚠️ **IMPORTANTE:** Substitua `SEU-USUARIO` pelo seu usuário do GitHub!

---

## 🔐 Autenticação no GitHub

Se o push pedir credenciais:

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: **https://github.com/settings/tokens**
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `insane-backend-deploy`
4. Selecione escopo: **`repo`** (marcar todas as opções)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Use o token como senha quando o Git pedir:
   - **Username:** seu-usuario-github
   - **Password:** o-token-gerado

### Opção 2: GitHub Desktop

1. Instale: **https://desktop.github.com**
2. Faça login
3. Adicione o repositório
4. Faça push pelo app

---

## ✅ Verificar se Funcionou

Após o push, acesse seu repositório no GitHub:
```
https://github.com/SEU-USUARIO/insane-backend
```

Você deve ver todos os arquivos do projeto!

---

## 🚀 Próximo Passo: Deploy na Vercel

Após o push funcionar, siga o guia:
**`PASSO_A_PASSO_DEPLOY.md`** (Passo 5 em diante)

---

## 🆘 Problemas?

### ❌ Erro: "remote origin already exists"
**Solução:**
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/insane-backend.git
```

### ❌ Erro: "Authentication failed"
**Solução:** Use Personal Access Token ao invés de senha

### ❌ Erro: "Permission denied"
**Solução:** Verifique se você tem permissão no repositório ou se criou o repositório

---

**📖 Mais detalhes:** `PASSO_A_PASSO_DEPLOY.md`



