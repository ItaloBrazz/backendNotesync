const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Aplicar middleware de autenticação em todas as rotas
router.use(taskController.authenticateToken);

// Rotas das tarefas
router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;

