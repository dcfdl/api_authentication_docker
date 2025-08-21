const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redisClient = require('../config/redis');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verificar a validade do token (assinatura e expiração)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Anexar o usuário à requisição
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

module.exports = { protect };
