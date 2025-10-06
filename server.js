require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Configurado para aceitar de qualquer origem
app.use(cors({
  origin: '*', // Em produção, especifique os domínios permitidos
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz - IMPORTANTE: Deve retornar algo
app.get("/", (req, res) => {
  res.json({ 
    message: "API Task Manager - Servidor funcionando!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    routes: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/api/health'
    }
  });
});

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK",
    database: "connected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco de dados com sucesso!");
    
    // Importar modelos após a conexão
    const { Usuario, Tarefa } = require("./models");
    console.log("📋 Modelos carregados: Usuario, Tarefa");
    
    // Sincronizar tabelas
    await sequelize.sync({ alter: true });
    console.log("📦 Tabelas sincronizadas com sucesso");
    
    // Importar rotas após a sincronização
    const authRoutes = require("./routes/authRoutes");
    const taskRoutes = require("./routes/taskRoutes");
    
    app.use("/api/auth", authRoutes);
    app.use("/api/tasks", taskRoutes);
    console.log("🛣️  Rotas registradas: /api/auth, /api/tasks");
    
    // Tratamento de rota não encontrada (404)
    app.use((req, res) => {
      res.status(404).json({ 
        error: "Rota não encontrada",
        path: req.path,
        method: req.method,
        availableRoutes: [
          'GET /',
          'GET /api/health',
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/tasks',
          'POST /api/tasks',
          'PUT /api/tasks/:id',
          'DELETE /api/tasks/:id'
        ]
      });
    });
    
    // Tratamento global de erros
    app.use((err, req, res, next) => {
      console.error("❌ Erro:", err);
      
      // Erro de CORS
      if (err.message === 'Origem não permitida pelo CORS') {
        return res.status(403).json({ 
          error: "Acesso negado",
          message: "Origem não permitida pelo CORS" 
        });
      }
      
      // Erro de JSON inválido
      if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
          error: "JSON inválido",
          message: "Verifique o formato dos dados enviados"
        });
      }
      
      // Erro genérico
      res.status(err.status || 500).json({ 
        error: "Erro interno do servidor",
        message: process.env.NODE_ENV === 'development' ? err.message : "Ocorreu um erro no servidor"
      });
    });
    
    // Iniciar o servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: https://backendnotesync.onrender.com`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'production'}`);
      console.log(`${'='.repeat(50)}\n`);
    });
    
    // Tratamento de shutdown graceful
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  SIGTERM recebido. Encerrando servidor...');
      server.close(async () => {
        console.log('🔌 Servidor HTTP fechado');
        await sequelize.close();
        console.log('🔌 Conexão com banco de dados fechada');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      console.log('\n⚠️  SIGINT recebido. Encerrando servidor...');
      server.close(async () => {
        console.log('🔌 Servidor HTTP fechado');
        await sequelize.close();
        console.log('🔌 Conexão com banco de dados fechada');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar o banco de dados
initializeDatabase();