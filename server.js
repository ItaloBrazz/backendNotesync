require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados!');
    
    // Sincronizar modelos
    const { Usuario, Tarefa } = require('./models');
    await sequelize.sync({ alter: true });
    console.log('📦 Tabelas sincronizadas!');
    
    // Registrar rotas
    const authRoutes = require('./routes/authRoutes');
    const taskRoutes = require('./routes/taskRoutes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Rota não encontrada' });
    });
    
    // Error handler
    app.use((err, req, res, next) => {
      console.error('❌ Erro:', err);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: https://backendnotesync.onrender.com`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();