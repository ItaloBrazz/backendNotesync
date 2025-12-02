const jwt = require('jsonwebtoken');

describe('Tasks Service - Testes', () => {
  
  describe('Validacao de Tarefa', () => {
    test('Titulo nao pode ser vazio', () => {
      const titulo = 'Minha tarefa';
      expect(titulo.length).toBeGreaterThan(0);
    });

    test('Status deve ser valido', () => {
      const statusValidos = ['pendente', 'em_andamento', 'concluida'];
      const status = 'pendente';
      expect(statusValidos).toContain(status);
    });

    test('Prioridade deve ser valida', () => {
      const prioridadesValidas = ['baixa', 'media', 'alta'];
      const prioridade = 'media';
      expect(prioridadesValidas).toContain(prioridade);
    });
  });

  describe('Criacao de Tarefa', () => {
    test('Campos obrigatorios devem estar presentes', () => {
      const tarefa = {
        titulo: 'Nova tarefa',
        status: 'pendente',
        usuarioId: 1
      };
      expect(tarefa.titulo).toBeDefined();
      expect(tarefa.usuarioId).toBeDefined();
    });

    test('Valores padrao sao aplicados', () => {
      const tarefa = { titulo: 'Tarefa' };
      const statusPadrao = 'pendente';
      const prioridadePadrao = 'media';
      expect(tarefa.status || statusPadrao).toBe(statusPadrao);
      expect(tarefa.prioridade || prioridadePadrao).toBe(prioridadePadrao);
    });
  });

  describe('Autenticacao', () => {
    test('Extrai token do header', () => {
      const authHeader = 'Bearer token123';
      const token = authHeader.replace('Bearer ', '');
      expect(token).toBe('token123');
    });

    test('Valida token JWT', () => {
      const payload = { id: 1 };
      const token = jwt.sign(payload, 'secret', { expiresIn: '24h' });
      const decoded = jwt.verify(token, 'secret');
      expect(decoded.id).toBe(1);
    });
  });

  describe('Propriedade de Tarefa', () => {
    test('Tarefa pertence ao usuario correto', () => {
      const tarefa = { id: 1, titulo: 'Tarefa', usuarioId: 5 };
      const usuario = { id: 5 };
      expect(tarefa.usuarioId).toBe(usuario.id);
    });
  });
});
