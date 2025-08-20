const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
    

// Define a rota para o cadastro de usuário
// POST /api/auth/register
router.post('/register', register);

// Define a rota para o login de usuário
// POST /api/auth/login
router.post('/login', login);

// Define a rota para obter o perfil do usuário
// GET /api/auth/profile
router.get('/profile', protect, getProfile);

// Define a rota para o logout do usuário
// POST /api/auth/logout
router.post('/logout', protect, logout);

module.exports = router;