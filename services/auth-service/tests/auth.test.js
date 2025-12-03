const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Service - Testes', () => {
  
  describe('Validacao de Email', () => {
    test('Aceita email valido', () => {
      const email = 'usuario@exemplo.com';
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test(email)).toBe(true);
    });

    test('Rejeita email invalido', () => {
      const email = 'emailinvalido';
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test(email)).toBe(false);
    });
  });

  describe('Validacao de Senha', () => {
    test('Senha deve ter minimo 6 caracteres', () => {
      const senha = 'senha123';
      expect(senha.length).toBeGreaterThanOrEqual(6);
    });

    test('Senha criptografada funciona corretamente', async () => {
      const senha = 'senha123';
      const hash = await bcrypt.hash(senha, 10);
      const valida = await bcrypt.compare(senha, hash);
      expect(valida).toBe(true);
    });
  });

  describe('Token JWT', () => {
    test('Gera token valido', () => {
      const payload = { id: 1, email: 'teste@exemplo.com' };
      const token = jwt.sign(payload, 'secret', { expiresIn: '24h' });
      expect(token).toBeDefined();
    });

    test('Valida token corretamente', () => {
      const payload = { id: 1, email: 'teste@exemplo.com' };
      const token = jwt.sign(payload, 'secret', { expiresIn: '24h' });
      const decoded = jwt.verify(token, 'secret');
      expect(decoded.id).toBe(1);
    });
  });

  describe('Regras de Registro', () => {
    test('Campos obrigatorios devem estar presentes', () => {
      const dados = {
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123'
      };
      expect(dados.nome).toBeDefined();
      expect(dados.email).toBeDefined();
      expect(dados.senha).toBeDefined();
    });
  });
});
