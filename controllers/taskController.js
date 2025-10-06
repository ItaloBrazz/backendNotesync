const jwt = require("jsonwebtoken");

// Função para obter o modelo Tarefa dinamicamente
const getTarefa = () => {
  return require("../models/Tarefa");
};

// Função para obter o modelo Usuario dinamicamente
const getUsuario = () => {
  return require("../models/Usuario");
};

module.exports = {
  // Criar nova tarefa
  createTask: async (req, res) => {
    try {
      const { title } = req.body;
      const userId = req.usuario.id;

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
      const userId = req.usuario.id;
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

  // ⭐ NOVA: Buscar tarefa específica por ID
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.usuario.id;

      const Tarefa = getTarefa();
      const tarefa = await Tarefa.findOne({
        where: { id, userId }
      });

      if (!tarefa) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      res.json(tarefa);
    } catch (error) {
      console.error("Erro ao buscar tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Atualizar tarefa (título e status)
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, status } = req.body;
      const userId = req.usuario.id;

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

  // ⭐ NOVA: Atualizar apenas o status da tarefa
  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.usuario.id;

      if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" });
      }

      // Validar se o status é válido
      const validStatuses = ['todo', 'in_progress', 'done'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Status inválido", 
          message: `Status deve ser: ${validStatuses.join(', ')}` 
        });
      }

      const Tarefa = getTarefa();
      const tarefa = await Tarefa.findOne({
        where: { id, userId }
      });

      if (!tarefa) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      await tarefa.update({ status });

      res.json(tarefa);
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  // Deletar tarefa
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.usuario.id;

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
  }
};