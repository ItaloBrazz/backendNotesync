#!/bin/bash

# Script para build e push das imagens Docker para Docker Hub
# Uso: ./scripts/build-and-push.sh [DOCKER_USERNAME] [TAG]

# Configurações
DOCKER_USERNAME=${1:-"seu-username"}  # Primeiro argumento ou padrão
TAG=${2:-"latest"}                     # Segundo argumento ou padrão
AUTH_SERVICE="notesync-auth-service"
TASKS_SERVICE="notesync-tasks-service"

echo "🔨 Building images..."
echo "   Docker Username: $DOCKER_USERNAME"
echo "   Tag: $TAG"
echo ""

# Verificar se está logado no Docker Hub
if ! docker info | grep -q "Username"; then
    echo "⚠️  Você precisa fazer login no Docker Hub primeiro:"
    echo "   docker login"
    exit 1
fi

# Build Auth Service
echo "📦 Building Auth Service..."
docker build -t $DOCKER_USERNAME/$AUTH_SERVICE:$TAG ./services/auth-service
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer build do Auth Service"
    exit 1
fi
echo "✅ Auth Service built: $DOCKER_USERNAME/$AUTH_SERVICE:$TAG"

# Build Tasks Service
echo "📦 Building Tasks Service..."
docker build -t $DOCKER_USERNAME/$TASKS_SERVICE:$TAG ./services/tasks-service
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer build do Tasks Service"
    exit 1
fi
echo "✅ Tasks Service built: $DOCKER_USERNAME/$TASKS_SERVICE:$TAG"

echo ""
echo "🚀 Pushing to Docker Hub..."

# Push Auth Service
echo "📤 Pushing Auth Service..."
docker push $DOCKER_USERNAME/$AUTH_SERVICE:$TAG
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push do Auth Service"
    exit 1
fi
echo "✅ Auth Service pushed"

# Push Tasks Service
echo "📤 Pushing Tasks Service..."
docker push $DOCKER_USERNAME/$TASKS_SERVICE:$TAG
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push do Tasks Service"
    exit 1
fi
echo "✅ Tasks Service pushed"

echo ""
echo "🎉 Done! Images available at:"
echo "   - $DOCKER_USERNAME/$AUTH_SERVICE:$TAG"
echo "   - $DOCKER_USERNAME/$TASKS_SERVICE:$TAG"
echo ""
echo "💡 Para usar no Render, configure a Image URL como:"
echo "   $DOCKER_USERNAME/$AUTH_SERVICE:$TAG"
echo "   $DOCKER_USERNAME/$TASKS_SERVICE:$TAG"

