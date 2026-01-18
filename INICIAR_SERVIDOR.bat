@echo off
echo ========================================
echo   INSANE PAY BACKEND - INICIANDO
echo ========================================
echo.

REM Verificar se .env existe
if not exist .env (
    echo [ERRO] Arquivo .env nao encontrado!
    echo.
    echo Criando arquivo .env basico...
    echo PORT=3000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/insane-pay >> .env
    echo MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-aqui >> .env
    echo MP_WEBHOOK_SECRET=seu-secret-aqui >> .env
    echo NODE_ENV=development >> .env
    echo FRONTEND_URL=http://localhost:5173 >> .env
    echo.
    echo [AVISO] Configure o arquivo .env com seus tokens do Mercado Pago!
    echo.
    pause
)

REM Verificar se node_modules existe
if not exist node_modules (
    echo [AVISO] Dependencias nao encontradas. Instalando...
    call npm install
    echo.
)

echo Verificando MongoDB...
echo [INFO] Certifique-se de que o MongoDB esta rodando!
echo.

echo Iniciando servidor...
echo.
echo Servidor rodando em: http://localhost:3000
echo Health Check: http://localhost:3000/health
echo.
echo Pressione Ctrl+C para parar o servidor.
echo.

REM Iniciar servidor
if exist node_modules\nodemon (
    call npm run dev
) else (
    call npm start
)

pause

