const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Métricas básicas
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

// Middleware de métricas
app.use((req, res, next) => {
  requestCount++;
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      errorCount++;
    }
    return originalSend.call(this, data);
  };
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    service: "Tasks Service",
    message: "Serviço de tarefas funcionando!",
    timestamp: new Date().toISOString()
  });
});

// Health check com verificação de banco
app.get('/health', async (req, res) => {
  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
      status: "OK",
      service: "tasks-service",
      database: "connected",
      uptime: `${uptime}s`,
      requests: requestCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: "ERROR",
      service: "tasks-service",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Métricas endpoint
app.get('/metrics', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    service: "tasks-service",
    uptime: `${uptime}s`,
    requests: requestCount,
    errors: errorCount,
    errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) + '%' : '0%',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

