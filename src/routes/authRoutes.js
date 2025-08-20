// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();

const { register, login, getProfile, logout, refresh } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
// Importe o novo middleware de rate limit
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

// Rotas Públicas
router.post('/register', register);

// Aplica o rate limiter APENAS na rota de login
router.post('/login', authLimiter, login);

// Rotas Privadas (Protegidas)
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logout);

module.exports = router;