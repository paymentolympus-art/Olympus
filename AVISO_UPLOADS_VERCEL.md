# ⚠️ AVISO IMPORTANTE: Uploads na Vercel

## 🔴 Problema Identificado

A Vercel **não persiste arquivos no filesystem**. Todos os arquivos são temporários e são deletados após cada execução da função.

### O que isso significa:

- ✅ Uploads funcionam **localmente**
- ❌ Uploads **NÃO funcionam** na Vercel (arquivos são perdidos)

---

## 💡 Soluções Recomendadas

### **Opção 1: Vercel Blob Storage (Mais Fácil)**

#### Instalar:
```bash
npm install @vercel/blob
```

#### Configurar:
1. Na Vercel, vá em **Storage** → **Create** → **Blob**
2. Conecte ao seu projeto
3. Copie o token gerado

#### Modificar `src/middlewares/upload.js`:

```javascript
import { put } from '@vercel/blob';

export const uploadProductImage = async (req, res, next) => {
  if (!req.file) {
    return next(errorHandler(400, 'Arquivo não fornecido'));
  }

  try {
    // Upload para Vercel Blob
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Atualizar produto com URL do Blob
    req.file.url = blob.url;
    next();
  } catch (error) {
    next(errorHandler(500, 'Erro ao fazer upload', error.message));
  }
};
```

---

### **Opção 2: Cloudinary (Recomendado para Produção)**

#### Instalar:
```bash
npm install cloudinary multer-storage-cloudinary
```

#### Configurar:
1. Criar conta em [cloudinary.com](https://cloudinary.com)
2. Obter `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Adicionar na Vercel como variáveis de ambiente

---

### **Opção 3: AWS S3**

#### Instalar:
```bash
npm install @aws-sdk/client-s3 multer-s3
```

---

### **Opção 4: Para Testes Iniciais**

Desabilitar temporariamente uploads e focar em testar outras funcionalidades:
- ✅ Criar produtos (sem imagem)
- ✅ Criar ofertas
- ✅ Criar pedidos
- ✅ Pagamentos PIX
- ✅ Webhooks

---

## 📝 Variáveis de Ambiente para Vercel

### Se usar Vercel Blob:
```
BLOB_READ_WRITE_TOKEN = vercel_blob_xxxxxxxxxxxx
```

### Se usar Cloudinary:
```
CLOUDINARY_CLOUD_NAME = seu-cloud-name
CLOUDINARY_API_KEY = xxxxxxxxxxxxxx
CLOUDINARY_API_SECRET = xxxxxxxxxxxxxx
```

---

## ⚡ Solução Temporária (Apenas para Deploy Inicial)

Para fazer o deploy funcionar **sem modificar uploads**:

1. Desabilite a rota de upload temporariamente
2. Teste todas as outras funcionalidades
3. Implemente solução de uploads depois

---

## 🎯 Recomendação

Para testes rápidos, use **Vercel Blob Storage** (Opção 1), pois:
- ✅ Integração nativa com Vercel
- ✅ Grátis até 1GB
- ✅ Setup rápido
- ✅ URLs públicas automáticas

---

**📌 Lembre-se:** Após implementar solução de uploads, atualize:
- `src/middlewares/upload.js`
- `src/controllers/productController.js` (método uploadProductImage)
- `src/controllers/orderbumpController.js` (método uploadOrderbumpImage)



