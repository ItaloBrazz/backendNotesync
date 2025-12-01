require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
const { DataTypes } = require('sequelize');

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    // Conectar ao banco com retry
    let retries = 5;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('✅ [Tasks Service] Conectado ao banco de dados!');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`⚠️  [Tasks Service] Tentando reconectar ao banco... (${5 - retries}/5)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Sincronizar modelos
    const Tarefa = require('./models/Tarefa');
    
    // Sincronizar tabelas com alterações
    await sequelize.sync({ alter: true });
    
    // Verificar e adicionar colunas se não existirem (migração automática)
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tableName = Tarefa.tableName;
      
      // Verificar se a tabela existe
      const [tableCheck] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        LIMIT 1;
      `);
      
      if (tableCheck && tableCheck.length > 0) {
        // Verificar colunas description e deadline
        const [columns] = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = '${tableName}' 
          AND column_name IN ('description', 'deadline')
          ORDER BY column_name;
        `);
        
        const existingColumns = columns.map(col => col.column_name);
        
        // Adicionar description se não existir
        if (!existingColumns.includes('description')) {
          console.log(`📝 Adicionando coluna "description" à tabela ${tableName}...`);
          await queryInterface.addColumn(tableName, 'description', {
            type: DataTypes.TEXT,
            allowNull: true,
          });
          console.log(`✅ Coluna "description" adicionada!`);
        }
        
        // Adicionar deadline se não existir
        if (!existingColumns.includes('deadline')) {
          console.log(`📝 Adicionando coluna "deadline" à tabela ${tableName}...`);
          await queryInterface.addColumn(tableName, 'deadline', {
            type: DataTypes.DATE,
            allowNull: true,
          });
          console.log(`✅ Coluna "deadline" adicionada!`);
        }
      }
    } catch (error) {
      console.log('⚠️  Migração automática: O sync já criará as colunas necessárias.');
    }
    
    console.log('📦 [Tasks Service] Tabelas sincronizadas!');
    
    // Registrar rotas
    const taskRoutes = require('./routes/taskRoutes');
    app.use('/api/tasks', taskRoutes);
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Rota não encontrada', service: 'tasks-service' });
    });
    
    // Error handler
    app.use((err, req, res, next) => {
      console.error('❌ [Tasks Service] Erro:', err);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        service: 'tasks-service',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [Tasks Service] Servidor rodando na porta ${PORT}`);
      console.log(`📍 [Tasks Service] Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 [Tasks Service] SIGTERM recebido, encerrando graciosamente...');
      await sequelize.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ [Tasks Service] Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

