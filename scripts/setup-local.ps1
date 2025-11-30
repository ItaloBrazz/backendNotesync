# Script de configuração para Windows PowerShell

Write-Host "🚀 Configurando ambiente local do NoteSync..." -ForegroundColor Yellow

# Criar arquivo .env se não existir
if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    
    # Gerar JWT_SECRET aleatório
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    # Atualizar JWT_SECRET no .env
    (Get-Content .env) -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret" | Set-Content .env
    
    Write-Host "✅ Arquivo .env criado com JWT_SECRET gerado!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env já existe, pulando criação..." -ForegroundColor Yellow
}

# Verificar Docker
try {
    docker --version | Out-Null
    # Tentar docker compose (versão nova) ou docker-compose (versão antiga)
    try {
        docker compose version | Out-Null
        $dockerComposeCmd = "docker compose"
    } catch {
        docker-compose --version | Out-Null
        $dockerComposeCmd = "docker-compose"
    }
    Write-Host "✅ Docker e Docker Compose estão instalados!" -ForegroundColor Green
    Write-Host "   Usando comando: $dockerComposeCmd" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Docker não está instalado. Por favor, instale o Docker Desktop primeiro." -ForegroundColor Red
    Write-Host "   Veja: INSTALACAO-DOCKER.md" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Ambiente configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env se necessário"
Write-Host "2. Execute: docker compose up --build"
Write-Host "   (ou 'docker-compose up --build' se usar versão antiga)"
Write-Host ""

