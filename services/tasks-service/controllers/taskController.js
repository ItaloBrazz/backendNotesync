const getTarefa = () => {
  return require("../models/Tarefa");
};

module.exports = {
  createTask: async (req, res) => {
    try {
      const { title, description, deadline } = req.body;
      const userId = req.usuario.id;

      if (!title) {
        return res.status(400).json({ error: "Título da tarefa é obrigatório" });
      }

      // Tratamento da descrição: aceita string vazia, null ou undefined
      let descriptionValue = null;
      if (description !== undefined && description !== null) {
        const trimmed = String(description).trim();
        descriptionValue = trimmed === '' ? null : trimmed;
      }

      // Tratamento do deadline: converte string para Date ou null
      let deadlineValue = null;
      if (deadline !== undefined && deadline !== null && deadline !== '') {
        console.log(`[CreateTask] Deadline recebido: "${deadline}" (tipo: ${typeof deadline})`);
        const deadlineDate = new Date(deadline);
        console.log(`[CreateTask] Deadline convertido para Date: ${deadlineDate}, isValid: ${!isNaN(deadlineDate.getTime())}`);
        
        if (!isNaN(deadlineDate.getTime())) {
          // Validar que a data não é no passado
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const deadlineDateOnly = new Date(deadlineDate);
          deadlineDateOnly.setHours(0, 0, 0, 0);
          
          if (deadlineDateOnly < now) {
            console.log(`[CreateTask] ❌ Data no passado rejeitada: ${deadlineDateOnly} < ${now}`);
            return res.status(400).json({ error: "Não é possível definir uma data que já passou" });
          }
          
          deadlineValue = deadlineDate;
          console.log(`[CreateTask] ✅ Deadline válido: ${deadlineValue}`);
        } else {
          console.log(`[CreateTask] ⚠️ Deadline inválido, será null`);
        }
      } else {
        console.log(`[CreateTask] Deadline não fornecido ou vazio`);
      }

      console.log(`[CreateTask] Criando tarefa - title: "${title}", description: "${descriptionValue}", deadline: "${deadlineValue}", userId: ${userId}`);

      const Tarefa = getTarefa();
      const novaTarefa = await Tarefa.create({
        title,
        description: descriptionValue,
        deadline: deadlineValue,
        userId,
        status: 'todo'
      });

      console.log(`[CreateTask] Tarefa criada com sucesso - id: ${novaTarefa.id}`);
      console.log(`[CreateTask] Deadline salvo no banco: "${novaTarefa.deadline}" (tipo: ${typeof novaTarefa.deadline})`);

      res.status(201).json(novaTarefa);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      console.error("Detalhes do erro:", error.message, error.stack);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

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

  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, deadline, status } = req.body;
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
      if (description !== undefined) updateData.description = description || null;
      if (deadline !== undefined) {
        // Tratamento do deadline: converte string para Date ou null
        if (deadline === null || deadline === '') {
          updateData.deadline = null;
        } else {
          const deadlineDate = new Date(deadline);
          if (!isNaN(deadlineDate.getTime())) {
            // Validar que a data não é no passado
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const deadlineDateOnly = new Date(deadlineDate);
            deadlineDateOnly.setHours(0, 0, 0, 0);
            
            if (deadlineDateOnly < now) {
              return res.status(400).json({ error: "Não é possível definir uma data que já passou" });
            }
            
            updateData.deadline = deadlineDate;
          } else {
            updateData.deadline = null;
          }
        }
      }
      if (status !== undefined) updateData.status = status;

      await tarefa.update(updateData);

      res.json(tarefa);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.usuario.id;

      if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" });
      }

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

