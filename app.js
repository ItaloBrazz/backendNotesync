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

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: "API Task Manager - Servidor funcionando!",
    timestamp: new Date().toISOString()
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "OK",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

module.exports = app;