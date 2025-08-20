// --- 1. IMPORTAÇÕES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const authRoutes = require('./routes/authRoutes');

// --- 2. CONFIGURAÇÃO INICIAL ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. CONEXÃO COM O REDIS ---
const redisClient = require('./config/redis');

// --- 4. CONEXÃO COM O MONGODB ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado com sucesso.');
    return true;
  } catch (error) {
    console.error('Falha na conexão com o MongoDB:', error.message);
    return false;
  }
};

// --- 5. MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 6. ROTAS ---
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus =
    redisClient.status === 'ready' ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'ok',
    mongo: mongoStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// --- 7. INICIALIZAÇÃO DO SERVIDOR ---
const startServer = async () => {
  const isDbConnected = await connectDB();

  if (isDbConnected) {
    // Só inicia o servidor se o arquivo for executado diretamente
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
      });
    }
  } else {
    console.log('Servidor não iniciado devido à falha na conexão com o banco de dados.');
  }
};

// Apenas inicia o servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

// Exporta o app para ser usado nos testes
module.exports = app;
