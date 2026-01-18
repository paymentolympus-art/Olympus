# Script PowerShell para preparar o projeto para deploy na Vercel
# Execute este script antes de fazer push para o GitHub

Write-Host "🚀 Preparando projeto para deploy na Vercel..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado. Execute este script dentro da pasta insane-backend" -ForegroundColor Red
    exit 1
}

# Verificar se Git está inicializado
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git inicializado!" -ForegroundColor Green
} else {
    Write-Host "✅ Git já inicializado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Verificando arquivos necessários..." -ForegroundColor Yellow

# Verificar arquivos necessários
$arquivosNecessarios = @(
    "vercel.json",
    "api/index.js",
    "src/app.js",
    "package.json"
)

$todosArquivosExistem = $true
foreach ($arquivo in $arquivosNecessarios) {
    if (Test-Path $arquivo) {
        Write-Host "  ✅ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $arquivo NÃO ENCONTRADO" -ForegroundColor Red
        $todosArquivosExistem = $false
    }
}

if (-not $todosArquivosExistem) {
    Write-Host ""
    Write-Host "❌ Alguns arquivos necessários estão faltando!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Adicionando arquivos ao Git..." -ForegroundColor Yellow

# Adicionar todos os arquivos (exceto node_modules e uploads)
git add .

# Verificar se há mudanças
$status = git status --short
if ($status) {
    Write-Host ""
    Write-Host "📝 Arquivos para commit:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    
    $commit = Read-Host "Deseja fazer commit agora? (s/n)"
    if ($commit -eq "s" -or $commit -eq "S") {
        $mensagem = Read-Host "Digite a mensagem do commit (ou pressione Enter para usar padrão)"
        if ([string]::IsNullOrWhiteSpace($mensagem)) {
            $mensagem = "Preparando para deploy na Vercel"
        }
        
        git commit -m $mensagem
        Write-Host ""
        Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️ Commit não realizado. Execute 'git commit' manualmente quando estiver pronto." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Nenhuma mudança para commitar" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PREPARAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Criar repositório no GitHub:" -ForegroundColor White
Write-Host "   - Acesse: https://github.com/new" -ForegroundColor Gray
Write-Host "   - Crie um novo repositório (público ou privado)" -ForegroundColor Gray
Write-Host "   - NÃO inicialize com README (já temos arquivos)" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Conectar repositório local ao GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Fazer deploy na Vercel:" -ForegroundColor White
Write-Host "   - Acesse: https://vercel.com/new" -ForegroundColor Gray
Write-Host "   - Importe seu repositório do GitHub" -ForegroundColor Gray
Write-Host "   - Configure as variáveis de ambiente (veja DEPLOY_VERCEL.md)" -ForegroundColor Gray
Write-Host "   - Clique em Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Para mais detalhes, consulte: DEPLOY_VERCEL.md" -ForegroundColor Cyan
Write-Host ""

