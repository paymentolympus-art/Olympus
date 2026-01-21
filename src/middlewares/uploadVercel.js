import multer from 'multer';
import { put } from '@vercel/blob';

// Configuração do multer para usar memória (não disco)
// O arquivo ficará em req.file.buffer
const storage = multer.memoryStorage();

// Filtro de arquivos (apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.'), false);
  }
};

// Configuração do multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware para upload de imagem de produto
export const uploadProductImage = upload.single('image');

// Middleware para upload de imagem de orderbump
export const uploadOrderbumpImage = upload.single('image');

/**
 * Função auxiliar para fazer upload para Vercel Blob
 * @param {Buffer} fileBuffer - Buffer do arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} folder - Pasta onde salvar (ex: 'products', 'orderbumps')
 * @returns {Promise<string>} URL da imagem
 */
export const uploadToVercelBlob = async (fileBuffer, filename, folder = 'products') => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN não configurado. Configure na Vercel → Settings → Environment Variables');
    }

    // Nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const blobFilename = `${folder}/${uniqueSuffix}-${filename}`;

    // Upload para Vercel Blob
    const blob = await put(blobFilename, fileBuffer, {
      access: 'public',
      token: token
    });

    return blob.url;
  } catch (error) {
    console.error('❌ Erro ao fazer upload para Vercel Blob:', error);
    throw error;
  }
};



