#!/bin/bash

echo "🚀 Configurando ambiente local do NoteSync..."

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    
    # Gerar JWT_SECRET aleatório
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-$(date +%s)")
    
    # Atualizar JWT_SECRET no .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    
    echo "✅ Arquivo .env criado com JWT_SECRET gerado!"
else
    echo "⚠️  Arquivo .env já existe, pulando criação..."
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo ""
echo "✅ Ambiente configurado!"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env se necessário"
echo "2. Execute: docker-compose up --build"
echo ""

