// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redisClient = require('../config/redis');

const protect = async (req, res, next) => {
  let token;

  // 1. Verificar se o token existe e está no cabeçalho 'Authorization'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extrair o token do cabeçalho (formato: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar se o token existe no Redis (se não existir, já foi feito logout)
      const session = await redisClient.get(`session:${jwt.decode(token).id}`);
      if (!session) {
        return res.status(401).json({ message: 'Não autorizado, sessão expirada ou inválida.' });
      }

      // 4. Verificar a validade do token usando a nossa JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 5. Anexar o usuário à requisição para ser usado nas próximas rotas
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      next(); // Se tudo estiver OK, continua para a próxima função (o controlador da rota)
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

module.exports = { protect };