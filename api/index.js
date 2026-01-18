/**
 * Serverless Function Entry Point para Vercel
 * 
 * Este arquivo é o ponto de entrada para o deploy na Vercel.
 * Importa e exporta a aplicação Express como uma função serverless.
 */

import app from '../src/app.js';

// Exportar como função serverless para Vercel
export default app;

