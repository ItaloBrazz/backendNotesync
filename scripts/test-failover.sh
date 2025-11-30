#!/bin/bash

echo "🧪 Iniciando testes de failover..."

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8080"

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $name: OK ($response)"
        return 0
    else
        echo -e "${RED}✗${NC} $name: FALHOU ($response)"
        return 1
    fi
}

echo -e "\n${YELLOW}=== Pré-teste: Verificando serviços ativos ===${NC}"
test_endpoint "$GATEWAY_URL/health" "Gateway"
test_endpoint "$GATEWAY_URL/api/auth/health" "Auth Service"
test_endpoint "$GATEWAY_URL/api/tasks/health" "Tasks Service"

echo -e "\n${YELLOW}=== Teste 1: Failover do Auth Service ===${NC}"
echo "Parando auth-service-1..."
docker-compose stop auth-service-1
sleep 3

echo "Testando acesso ao Auth Service via backup..."
if test_endpoint "$GATEWAY_URL/api/auth/health" "Auth Service (via backup)"; then
    echo -e "${GREEN}✓ Failover do Auth Service funcionando!${NC}"
else
    echo -e "${RED}✗ Failover do Auth Service falhou${NC}"
fi

echo "Reiniciando auth-service-1..."
docker-compose start auth-service-1
sleep 5

echo -e "\n${YELLOW}=== Teste 2: Failover do Tasks Service ===${NC}"
echo "Parando tasks-service-1..."
docker-compose stop tasks-service-1
sleep 3

echo "Testando acesso ao Tasks Service via backup..."
if test_endpoint "$GATEWAY_URL/api/tasks/health" "Tasks Service (via backup)"; then
    echo -e "${GREEN}✓ Failover do Tasks Service funcionando!${NC}"
else
    echo -e "${RED}✗ Failover do Tasks Service falhou${NC}"
fi

echo "Reiniciando tasks-service-1..."
docker-compose start tasks-service-1
sleep 5

echo -e "\n${YELLOW}=== Teste 3: Recuperação após falha ===${NC}"
echo "Verificando se os serviços recuperaram..."
test_endpoint "$GATEWAY_URL/api/auth/health" "Auth Service (recuperado)"
test_endpoint "$GATEWAY_URL/api/tasks/health" "Tasks Service (recuperado)"

echo -e "\n${GREEN}✅ Testes de failover concluídos!${NC}"

