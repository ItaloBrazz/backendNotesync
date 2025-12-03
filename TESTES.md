# Testes Unitarios

Este projeto implementa testes automatizados para validar as regras de negocio.

## Executar Testes

### Auth Service
```bash
cd services/auth-service
npm test
```

### Tasks Service
```bash
cd services/tasks-service
npm test
```

## Cobertura

**Auth Service (7 testes)**
- Validacao de email
- Validacao de senha e criptografia
- Geracao e validacao de tokens JWT
- Campos obrigatorios para registro

**Tasks Service (8 testes)**
- Validacao de titulo, status e prioridade
- Criacao de tarefas
- Autenticacao JWT
- Propriedade de tarefas por usuario

## CI/CD

Os testes rodam automaticamente no GitHub Actions:
- A cada push nas branches main e test-devops
- A cada pull request
- O build so e aprovado se todos os testes passarem

## Tecnologias

- Jest: Framework de testes
- Node.js: Ambiente de execucao
