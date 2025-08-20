const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validação básica
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Por favor, preencha todos os campos.' });
    }

    // 2. Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Este email já está em uso.' }); // 409 Conflict
    }

    // 3. Criar e salvar o novo usuário
    const newUser = new User({ name, email, password });
    await newUser.save();

    // 4. Enviar uma resposta de sucesso
    // Não envie a senha de volta, mesmo que hasheada!
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' }); // 201 Created
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res
      .status(500)
      .json({ message: 'Ocorreu um erro no servidor.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // 1. Gerar o Access Token (curta duração)
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 2. Gerar o Refresh Token (longa duração)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // 3. Salvar o REFRESH token no Redis (o access token não precisa mais ser salvo)
    // A chave agora indica que é um refresh token
    const redisKey = `refresh:${user._id}`;
    const redisExpiration = 7 * 24 * 60 * 60; // 7 dias em segundos
    await redisClient.set(redisKey, refreshToken, 'EX', redisExpiration);

    // 4. Enviar ambos os tokens para o cliente
    res.status(200).json({ accessToken, refreshToken });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

const logout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove o refresh token do Redis
    await redisClient.del(`refresh:${userId}`);

    res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token não fornecido.' });
  }

  try {
    // 1. Verificar a validade do refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Verificar se o refresh token existe no Redis
    const storedToken = await redisClient.get(`refresh:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Refresh token inválido ou expirado.' });
    }

    // 3. Gerar um NOVO access token
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token inválido ou expirado.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  refresh
};
