require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000', 
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'file://',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando!" });
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco de dados com sucesso!");
    
    // Importar modelos após a conexão
    const { Usuario } = require("./models");
    
    // Sincronizar tabelas
    await sequelize.sync({ alter: true });
    console.log("📦 Tabelas sincronizadas com sucesso");
    
    // Importar rotas após a sincronização
    const authRoutes = require("./routes/authRoutes");
    const taskRoutes = require("./routes/taskRoutes");
    app.use("/api/auth", authRoutes);
    app.use("/api/tasks", taskRoutes);
    
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    process.exit(1);
  }
}

// Inicializar o banco de dados
initializeDatabase();
