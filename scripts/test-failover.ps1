# Script de teste de failover para Windows PowerShell

Write-Host "🧪 Iniciando testes de failover..." -ForegroundColor Yellow

$GATEWAY_URL = "http://localhost:8080"

function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Name
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $Name : OK ($($response.StatusCode))" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ $Name : FALHOU" -ForegroundColor Red
        return $false
    }
    return $false
}

Write-Host "`n=== Pré-teste: Verificando serviços ativos ===" -ForegroundColor Yellow
Test-Endpoint -Url "$GATEWAY_URL/health" -Name "Gateway"
Test-Endpoint -Url "$GATEWAY_URL/api/auth/health" -Name "Auth Service"
Test-Endpoint -Url "$GATEWAY_URL/api/tasks/health" -Name "Tasks Service"

# Detectar comando docker compose
try {
    docker compose version | Out-Null
    $dockerComposeCmd = "docker compose"
} catch {
    $dockerComposeCmd = "docker-compose"
}

Write-Host "`n=== Teste 1: Failover do Auth Service ===" -ForegroundColor Yellow
Write-Host "Parando auth-service-1..."
& $dockerComposeCmd stop auth-service-1
Start-Sleep -Seconds 3

Write-Host "Testando acesso ao Auth Service via backup..."
if (Test-Endpoint -Url "$GATEWAY_URL/api/auth/health" -Name "Auth Service (via backup)") {
    Write-Host "✓ Failover do Auth Service funcionando!" -ForegroundColor Green
}

Write-Host "Reiniciando auth-service-1..."
& $dockerComposeCmd start auth-service-1
Start-Sleep -Seconds 5

Write-Host "`n=== Teste 2: Failover do Tasks Service ===" -ForegroundColor Yellow
Write-Host "Parando tasks-service-1..."
& $dockerComposeCmd stop tasks-service-1
Start-Sleep -Seconds 3

Write-Host "Testando acesso ao Tasks Service via backup..."
if (Test-Endpoint -Url "$GATEWAY_URL/api/tasks/health" -Name "Tasks Service (via backup)") {
    Write-Host "✓ Failover do Tasks Service funcionando!" -ForegroundColor Green
}

Write-Host "Reiniciando tasks-service-1..."
& $dockerComposeCmd start tasks-service-1
Start-Sleep -Seconds 5

Write-Host "`n=== Teste 3: Recuperação após falha ===" -ForegroundColor Yellow
Write-Host "Verificando se os serviços recuperaram..."
Test-Endpoint -Url "$GATEWAY_URL/api/auth/health" -Name "Auth Service (recuperado)"
Test-Endpoint -Url "$GATEWAY_URL/api/tasks/health" -Name "Tasks Service (recuperado)"

Write-Host "`n✅ Testes de failover concluídos!" -ForegroundColor Green

