# Script para build e push das imagens Docker para Docker Hub
# Uso: .\scripts\build-and-push.ps1 [DOCKER_USERNAME] [TAG]

param(
    [string]$DockerUsername = "seu-username",
    [string]$Tag = "latest"
)

$AUTH_SERVICE = "notesync-auth-service"
$TASKS_SERVICE = "notesync-tasks-service"

Write-Host "🔨 Building images..." -ForegroundColor Yellow
Write-Host "   Docker Username: $DockerUsername" -ForegroundColor Cyan
Write-Host "   Tag: $Tag" -ForegroundColor Cyan
Write-Host ""

# Verificar se está logado no Docker Hub
try {
    docker info | Out-Null
} catch {
    Write-Host "⚠️  Você precisa fazer login no Docker Hub primeiro:" -ForegroundColor Yellow
    Write-Host "   docker login" -ForegroundColor Cyan
    exit 1
}

# Build Auth Service
Write-Host "📦 Building Auth Service..." -ForegroundColor Yellow
docker build -t "$DockerUsername/$AUTH_SERVICE`:$Tag" ./services/auth-service
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do Auth Service" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Auth Service built: $DockerUsername/$AUTH_SERVICE`:$Tag" -ForegroundColor Green

# Build Tasks Service
Write-Host "📦 Building Tasks Service..." -ForegroundColor Yellow
docker build -t "$DockerUsername/$TASKS_SERVICE`:$Tag" ./services/tasks-service
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do Tasks Service" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tasks Service built: $DockerUsername/$TASKS_SERVICE`:$Tag" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Pushing to Docker Hub..." -ForegroundColor Yellow

# Push Auth Service
Write-Host "📤 Pushing Auth Service..." -ForegroundColor Yellow
docker push "$DockerUsername/$AUTH_SERVICE`:$Tag"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push do Auth Service" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Auth Service pushed" -ForegroundColor Green

# Push Tasks Service
Write-Host "📤 Pushing Tasks Service..." -ForegroundColor Yellow
docker push "$DockerUsername/$TASKS_SERVICE`:$Tag"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push do Tasks Service" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tasks Service pushed" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Done! Images available at:" -ForegroundColor Green
Write-Host "   - $DockerUsername/$AUTH_SERVICE`:$Tag"
Write-Host "   - $DockerUsername/$TASKS_SERVICE`:$Tag"
Write-Host ""
Write-Host "💡 Para usar no Render, configure a Image URL como:" -ForegroundColor Cyan
Write-Host "   $DockerUsername/$AUTH_SERVICE`:$Tag"
Write-Host "   $DockerUsername/$TASKS_SERVICE`:$Tag"

