const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
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
    res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    // 2. Encontrar o usuário no banco de dados
    const user = await User.findOne({ email });
    if (!user) {
      // Mensagem genérica por segurança (não informa se o erro foi no email ou na senha)
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // 3. Comparar a senha fornecida com a senha hasheada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // 4. Gerar o Token JWT
    const token = jwt.sign(
      { id: user._id }, // Carga útil (payload) - o que queremos que o token carregue
      process.env.JWT_SECRET, // Nossa chave secreta
      { expiresIn: '15m' } // Opções (define a validade de 15 minutos)
    );

    // 5. Salvar o token no Redis com expiração
    // Chave: 'session:<userId>', Valor: token, Expiração: 900 segundos (15 min)
    await redisClient.set(`session:${user._id}`, token, 'EX', 900);

    // 6. Enviar o token para o cliente
    res.status(200).json({ token });

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
    // Pega o ID do usuário que foi anexado pelo middleware 'protect'
    const userId = req.user._id;

    // Remove a sessão do Redis
    await redisClient.del(`session:${userId}`);

    res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
