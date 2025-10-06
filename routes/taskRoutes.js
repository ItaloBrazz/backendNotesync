const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middlewares/authMiddleware");

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas das tarefas
router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById); // Nova rota para buscar tarefa específica
router.put("/:id", taskController.updateTask);
router.patch("/:id/status", taskController.updateTaskStatus); // Rota para atualizar apenas o status
router.delete("/:id", taskController.deleteTask);

module.exports = router;