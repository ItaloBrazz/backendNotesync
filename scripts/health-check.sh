#!/bin/bash

# Script para verificar saúde de todos os serviços

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

GATEWAY_URL="http://localhost:8080"

echo -e "${YELLOW}🏥 Verificando saúde dos serviços...${NC}\n"

# Função para testar endpoint
check_service() {
    local url=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $name: ${GREEN}SAUDÁVEL${NC} (HTTP $response)"
        
        # Buscar detalhes do health check
        details=$(curl -s "$url" 2>/dev/null)
        if [ ! -z "$details" ]; then
            echo "   Detalhes: $details" | head -c 100
            echo ""
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $name: ${RED}INDISPONÍVEL${NC} (HTTP $response)"
        return 1
    fi
}

# Verificar serviços
check_service "$GATEWAY_URL/health" "Gateway"
check_service "$GATEWAY_URL/api/auth/health" "Auth Service"
check_service "$GATEWAY_URL/api/tasks/health" "Tasks Service"

# Verificar métricas
echo -e "\n${YELLOW}📊 Métricas:${NC}"
curl -s "$GATEWAY_URL/api/auth/metrics" 2>/dev/null | head -5
echo ""
curl -s "$GATEWAY_URL/api/tasks/metrics" 2>/dev/null | head -5

echo -e "\n${YELLOW}✅ Verificação concluída!${NC}"

