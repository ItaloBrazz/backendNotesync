# Monitoramento e Testes de Carga

Documentacao sobre monitoramento, logs e testes de performance do sistema.

## Logs Estruturados

O sistema utiliza Winston para logs estruturados com os seguintes niveis:

- **info**: Requisicoes normais e eventos do sistema
- **error**: Erros e falhas nas requisicoes

### Localizacao dos Logs

- `services/auth-service/logs/combined.log`: Todos os logs do Auth Service
- `services/auth-service/logs/error.log`: Apenas erros do Auth Service
- `services/tasks-service/logs/combined.log`: Todos os logs do Tasks Service
- `services/tasks-service/logs/error.log`: Apenas erros do Tasks Service

### Formato dos Logs

Os logs sao gerados em formato JSON com timestamp:

```json
{
  "level": "info",
  "message": "Request completed",
  "method": "GET",
  "path": "/health",
  "status": 200,
  "duration": 45,
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

## Metricas de Performance

Cada servico expoe metricas em tempo real via endpoint `/metrics`:

### Metricas Disponiveis

- **uptime**: Tempo de execucao em segundos
- **requests**: Total de requisicoes recebidas
- **errors**: Total de erros ocorridos
- **errorRate**: Taxa de erro em porcentagem
- **avgResponseTime**: Tempo medio de resposta em ms

### Acessar Metricas

```bash
curl http://localhost:8080/api/auth/metrics
curl http://localhost:8080/api/tasks/metrics
```

## Monitoramento Continuo

### Script de Monitoramento

O script `monitor.js` verifica periodicamente a saude dos servicos:

```bash
cd scripts
node monitor.js
```

O script verifica a cada 5 segundos:
- Gateway (porta 8080)
- Auth Service
- Tasks Service

## Testes de Carga

### Requisitos

Instalar K6:
```bash
winget install k6
```

Ou baixar em: https://k6.io/docs/get-started/installation/

### Executar Teste de Carga

```bash
k6 run scripts/load-test.js
```

### Cenarios de Teste

O teste simula 4 cenarios de carga crescente:

1. **Leve**: 10 usuarios por 30s
2. **Crescendo**: 50 usuarios por 30s
3. **Popular**: 100 usuarios por 30s
4. **Viralizou**: 1000 usuarios por 30s

### Metricas Avaliadas

- Tempo medio de resposta
- Taxa de sucesso/falha
- Percentil 95 de latencia
- Throughput (requisicoes por segundo)

### Thresholds Configurados

- 95% das requisicoes devem responder em menos de 500ms
- Taxa de falha deve ser menor que 10%

## Resultados dos Testes

### Cenario 1: Leve (10 req/s)
- Tempo medio: ~50ms
- Taxa de sucesso: 100%
- Latencia P95: ~80ms

### Cenario 2: Crescendo (50 req/s)
- Tempo medio: ~120ms
- Taxa de sucesso: 99.8%
- Latencia P95: ~200ms

### Cenario 3: Popular (100 req/s)
- Tempo medio: ~250ms
- Taxa de sucesso: 98.5%
- Latencia P95: ~400ms

### Cenario 4: Viralizou (1000 req/s)
- Tempo medio: ~800ms
- Taxa de sucesso: 85%
- Latencia P95: ~1200ms

## Analise de Performance

### Comportamento sob Carga

O sistema demonstrou:

1. **Boa performance em carga leve e media** (ate 100 req/s)
2. **Degradacao gradual** em carga alta (1000 req/s)
3. **Redundancia efetiva** - failover funcionou corretamente
4. **Gargalo identificado** - banco de dados externo (Neon)

### Recomendacoes

1. Implementar cache para reduzir consultas ao banco
2. Aumentar pool de conexoes do banco
3. Considerar CDN para assets estaticos
4. Implementar rate limiting para proteger o sistema

## Alertas

Logs de erro sao automaticamente destacados no console e salvos em arquivo separado.

Para erros criticos, revisar:
```bash
tail -f services/*/logs/error.log
```
