const jwt = require("jsonwebtoken");

// Função para obter o modelo Tarefa dinamicamente
const getTarefa = () => {
  return require("../models/Tarefa");
};

// Função para obter o modelo Usuario dinamicamente
const getUsuario = () => {
  return require("../models/Usuario");
};

// Função para verificar autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  // Criar nova tarefa
  createTask: async (req, res) => {
    try {
      const { title } = req.body;
      const userId = req.user.id;

      if (!title) {
        return res.status(400).json({ error: "Título da tarefa é obrigatório" });
      }

      const Tarefa = getTarefa();
      const novaTarefa = await Tarefa.create({
        title,
        userId,
        status: 'todo'
      });

      res.status(201).json(novaTarefa);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Buscar todas as tarefas do usuário
  getTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const Tarefa = getTarefa();

      const tarefas = await Tarefa.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      res.json(tarefas);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Atualizar tarefa
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, status } = req.body;
      const userId = req.user.id;

      const Tarefa = getTarefa();
      const tarefa = await Tarefa.findOne({
        where: { id, userId }
      });

      if (!tarefa) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (status !== undefined) updateData.status = status;

      await tarefa.update(updateData);

      res.json(tarefa);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Deletar tarefa
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const Tarefa = getTarefa();
      const tarefa = await Tarefa.findOne({
        where: { id, userId }
      });

      if (!tarefa) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      await tarefa.destroy();

      res.json({ message: "Tarefa excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Middleware de autenticação
  authenticateToken
};
