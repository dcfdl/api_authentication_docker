const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/userModel');
const redisClient = require('../src/config/redis');

// SIMULAÇÃO (MOCK) DO REDIS:

jest.mock('../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'), // Simula o fechamento da conexão
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await redisClient.quit(); 
});

beforeEach(async () => {
  await User.deleteMany({});
  // Limpa as simulações antes de cada teste para garantir um estado limpo
  jest.clearAllMocks();
});

describe('Auth API', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Usuário cadastrado com sucesso!');
  });

  it('should not register a user with an existing email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: 'test@example.com',
      password: 'password456',
    });
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('message', 'Este email já está em uso.');
  });

  it('should login a registered user and return a token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Email ou senha inválidos.');
  });

  it('should access a protected route with a valid token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Protected User',
      email: 'protected@example.com',
      password: 'password123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'protected@example.com',
      password: 'password123',
    });
    const token = loginRes.body.token;

    // SIMULAÇÃO: Dizemos ao nosso Redis falso que a sessão existe.
    redisClient.get.mockResolvedValue(token);

    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.statusCode).toEqual(200);
    expect(profileRes.body).toHaveProperty('email', 'protected@example.com');
  });
});