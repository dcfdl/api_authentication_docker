const rateLimit = require('express-rate-limit');

// Configura o limitador de taxa para as rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
  max: 10, // Limite de requisições por IP dentro da janela de tempo
  standardHeaders: true, // Retorna informações do limite nos cabeçalhos `RateLimit-*`
  legacyHeaders: false, // Desabilita os cabeçalhos antigos `X-RateLimit-*`
  message: {
    message: 'Muitas tentativas de login a partir deste IP. Por favor, tente novamente após 15 minutos.',
  },
});

module.exports = {
  authLimiter,
};