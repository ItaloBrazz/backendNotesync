# NoteSync Backend - Microserviços

Backend do NoteSync organizado em arquitetura de microserviços com alta disponibilidade, containerizado com Docker.

## 🏗️ Arquitetura

Este backend contém:

1. **Auth Service** (`services/auth-service`) - Autenticação e autorização
   - Registro e login de usuários
   - Geração e validação de tokens JWT
   - Porta: 3001

2. **Tasks Service** (`services/tasks-service`) - Gerenciamento de tarefas
   - CRUD completo de tarefas
   - Validação via JWT
   - Porta: 3002

3. **API Gateway** (`gateway`) - Nginx como proxy reverso
   - Roteamento de requisições
   - Load balancing entre instâncias
   - Failover automático
   - Porta: 8080

## 📋 Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Neon Database** (ou outro PostgreSQL) - [Criar conta gratuita](https://neon.tech)
- Git (opcional, para clonar o repositório)

> ⚠️ **Importante**: No Windows, use `docker compose` (sem hífen) ao invés de `docker-compose`

## 🚀 Instalação e Execução

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `backendNotesync/`:

```env
# URL de conexão do Neon Database (ou outro PostgreSQL)
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require

# Chave secreta para assinar tokens JWT (use uma string aleatória e segura)
JWT_SECRET=sua-chave-jwt-secreta-super-segura-aqui

# Ambiente (production, development, test)
NODE_ENV=production
```

**Exemplo de DATABASE_URL do Neon:**
```
postgresql://usuario:senha@ep-exemplo-123.us-east-1.aws.neon.tech/database?sslmode=require&channel_binding=require
```

> 💡 **Dica**: Use o arquivo `env.example` como referência ou consulte a documentação do seu provedor de banco de dados.

### 2. Executar com Docker Compose

```bash
# Navegar para o diretório do backend
cd backendNotesync

# Construir e iniciar todos os serviços
docker compose up --build

# Ou em modo detached (background)
docker compose up --build -d

# Parar os serviços
docker compose down

# Ver logs
docker compose logs -f

# Ver status dos containers
docker compose ps
```

### 3. Executar Localmente (Desenvolvimento)

Se preferir executar sem Docker:

```bash
# Instalar dependências do Auth Service
cd services/auth-service
npm install

# Instalar dependências do Tasks Service
cd ../tasks-service
npm install

# Em terminais separados, iniciar cada serviço:
# Terminal 1 - Auth Service
cd services/auth-service
npm start

# Terminal 2 - Tasks Service
cd services/tasks-service
npm start
```

## 🌐 Endpoints

### API Gateway (Porta 8080)

- **Base URL**: `http://localhost:8080`
- **Health Check**: `GET http://localhost:8080/health`

### Auth Service

- **Registro**: `POST http://localhost:8080/api/auth/register`
- **Login**: `POST http://localhost:8080/api/auth/login`
- **Health**: `GET http://localhost:8080/api/auth/health`
- **Métricas**: `GET http://localhost:8080/api/auth/metrics`

### Tasks Service

- **Listar tarefas**: `GET http://localhost:8080/api/tasks`
- **Criar tarefa**: `POST http://localhost:8080/api/tasks`
- **Atualizar tarefa**: `PUT http://localhost:8080/api/tasks/:id`
- **Atualizar status**: `PATCH http://localhost:8080/api/tasks/:id/status`
- **Deletar tarefa**: `DELETE http://localhost:8080/api/tasks/:id`
- **Health**: `GET http://localhost:8080/api/tasks/health`
- **Métricas**: `GET http://localhost:8080/api/tasks/metrics`

> 🔐 **Autenticação**: Endpoints do Tasks Service requerem header `Authorization: Bearer <token>`

## 🔍 Verificar Saúde dos Serviços

```bash
# Gateway
curl http://localhost:8080/health

# Auth Service
curl http://localhost:8080/api/auth/health

# Tasks Service
curl http://localhost:8080/api/tasks/health
```

## 📊 Métricas

```bash
# Métricas do Auth Service
curl http://localhost:8080/api/auth/metrics

# Métricas do Tasks Service
curl http://localhost:8080/api/tasks/metrics
```

## 🐳 Docker Compose

O `docker-compose.yml` está configurado com:

- **2 instâncias do Auth Service** (primária + backup) - Redundância
- **2 instâncias do Tasks Service** (primária + backup) - Redundância
- **API Gateway (Nginx)** na porta 8080 - Load balancing e failover
- **Health checks** configurados para monitoramento automático
- **Rede interna** para comunicação entre serviços

### Comandos Úteis

```bash
# Ver logs de um serviço específico
docker compose logs -f auth-service-1

# Reiniciar um serviço específico
docker compose restart auth-service-1

# Reconstruir apenas um serviço
docker compose up --build auth-service-1

# Ver uso de recursos
docker compose stats
```

## 📁 Estrutura do Projeto

```
backendNotesync/
├── services/
│   ├── auth-service/          # Serviço de autenticação
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── tasks-service/         # Serviço de tarefas
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── Dockerfile
│       └── package.json
├── gateway/                   # API Gateway (Nginx)
│   ├── nginx.conf
│   └── Dockerfile
├── scripts/                   # Scripts auxiliares
├── docker-compose.yml         # Orquestração dos serviços
├── .env                       # Variáveis de ambiente (não versionado)
├── env.example                # Exemplo de variáveis de ambiente
└── README.md
```

## 🔒 Segurança

- ✅ JWT tokens assinados com secret configurável
- ✅ SSL obrigatório para conexão com banco de dados (Neon)
- ✅ CORS configurado no Gateway
- ✅ Validação de tokens em cada requisição protegida
- ✅ Health checks para monitoramento
- ✅ Variáveis sensíveis em `.env` (não versionado)

## 🧪 Testes de Failover

Para testar a redundância e failover:

```bash
# Windows PowerShell
.\scripts\test-failover.ps1

# Linux/Mac
./scripts/test-failover.sh
```

## 🚀 Deploy

### Deploy no Render

Consulte os guias de deploy:
- Deploy direto no Render (build no Render)
- Deploy via Docker Hub (build local + push)

Ou use o arquivo `render.yaml` para deploy automatizado via Blueprint.

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker compose logs nome-do-servico

# Verificar variáveis de ambiente
docker compose config
```

### Health check falhando

- Verifique se o serviço está respondendo: `curl http://localhost:PORT/health`
- Aumente o `start_period` no `docker-compose.yml` se necessário
- Verifique os logs do container

### Erro de conexão com banco

- Verifique se `DATABASE_URL` está correto no `.env`
- Confirme que o banco está acessível (firewall, SSL, etc.)
- Teste a conexão manualmente

## 📝 Licença

MIT
