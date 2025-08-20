const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
  console.log('Conectado ao Redis com sucesso! (a partir do config)');
});

redisClient.on('error', (err) => {
  console.error('Não foi possível conectar ao Redis:', err);
});

module.exports = redisClient;
