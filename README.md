# API de Autenticação com Node.js, MongoDB e Redis

![Node.js](https://img.shields.io/badge/Node.js-18.x-blue?style=for-the-badge&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-20.10-blue?style=for-the-badge&logo=docker)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4-blue?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-6.2-blue?style=for-the-badge&logo=redis)

## 📄 Sobre o Projeto

Esta é uma API RESTful completa para autenticação de usuários, construída como parte de um desafio de desenvolvimento. A aplicação permite o cadastro seguro de usuários, login com geração de token JWT, gerenciamento de sessão com Redis e proteção de rotas privadas.

Todo o ambiente de desenvolvimento é containerizado com Docker, garantindo consistência e facilidade na configuração.

## ✨ Funcionalidades

- ✅ **Cadastro de Usuários:** Armazenamento seguro de credenciais no MongoDB.
- ✅ **Hashing de Senhas:** Utilização do `bcrypt` para garantir que as senhas nunca sejam armazenadas em texto puro.
- ✅ **Autenticação por Token:** Login via e-mail e senha com geração de um token **JWT (JSON Web Token)**.
- ✅ **Gerenciamento de Sessão:** Armazenamento do token de sessão no **Redis**, com expiração automática de 15 minutos.
- ✅ **Logout:** Invalidação da sessão através da remoção do token do Redis.
- ✅ **Rotas Protegidas:** Middleware de autenticação que valida o token JWT e a sessão no Redis antes de permitir o acesso a endpoints privados.
- ✅ **Ambiente Containerizado:** Uso de **Docker** e **Docker Compose** para orquestrar os serviços da aplicação (Node.js, MongoDB, Redis).

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Banco de Dados:** MongoDB (com Mongoose para modelagem)
- **Cache / Sessão:** Redis (com ioredis)
- **Autenticação:** JSON Web Token (JWT)
- **Segurança:** bcrypt.js (para hashing de senhas), dotenv (para variáveis de ambiente)
- **Containerização:** Docker, Docker Compose

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar a aplicação em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (v18 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/dcfdl/NOME-DO-SEU-REPOSITORIO.git](https://github.com/dcfdl/NOME-DO-SEU-REPOSITORIO.git)
    cd NOME-DO-SEU-REPOSITORIO
    ```

2.  **Crie o arquivo de variáveis de ambiente:**
    Crie uma cópia do arquivo de exemplo `.env.example` e renomeie para `.env`.

    ```bash
    cp .env.example .env
    ```

    _Obs: O arquivo `.env` já está no `.gitignore` para não ser enviado ao seu repositório._

3.  **Preencha o arquivo `.env`:**
    Abra o arquivo `.env` e, se necessário, ajuste as variáveis. O `JWT_SECRET` deve ser uma string longa e aleatória.

    ```
    # Aplicação
    PORT=3000

    # MongoDB
    MONGO_INITDB_ROOT_USERNAME=root
    MONGO_INITDB_ROOT_PASSWORD=root
    MONGO_URI=mongodb://root:root@mongo:27017/authdb?authSource=admin

    # Redis
    REDIS_URL=redis://redis:6379

    # JWT
    JWT_SECRET=sua-chave-secreta-super-segura-aqui
    ```

4.  **Construa as imagens e inicie os contêineres:**
    Este comando irá baixar as imagens do Mongo e Redis, construir a imagem da sua API e iniciar todos os serviços.
    ```bash
    docker-compose up --build
    ```

A API estará disponível em `http://localhost:3000`.

## ⚙️ Endpoints da API

Aqui está a lista de endpoints disponíveis para teste.

### Autenticação

#### `POST /api/auth/register`

Registra um novo usuário.

- **Autenticação:** Pública.
- **Body:**
  ```json
  {
    "name": "Charles Babbage",
    "email": "charles@example.com",
    "password": "uma_senha_forte_123"
  }
  ```
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "message": "Usuário cadastrado com sucesso!"
  }
  ```

#### `POST /api/auth/login`

Autentica um usuário e retorna um token JWT.

- **Autenticação:** Pública.
- **Body:**
  ```json
  {
    "email": "charles@example.com",
    "password": "uma_senha_forte_123"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### `POST /api/auth/logout`

Realiza o logout do usuário, invalidando a sessão no Redis.

- **Autenticação:** Privada (requer token).
- **Header:** `Authorization: Bearer <seu_token>`
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "message": "Logout realizado com sucesso."
  }
  ```

### Usuários

#### `GET /api/auth/profile`

Retorna os dados do usuário autenticado.

- **Autenticação:** Privada (requer token).
- **Header:** `Authorization: Bearer <seu_token>`
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "_id": "60f...",
    "name": "Charles Babbage",
    "email": "charles@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

---

## 📂 Estrutura do Projeto

```
/
├── public/             # Arquivos do Frontend (HTML, CSS)
├── src/
│   ├── config/         # Configurações de conexão (DB, Redis)
│   ├── controllers/    # Lógica das rotas
│   ├── middlewares/    # Middlewares (ex: autenticação)
│   ├── models/         # Schemas do Mongoose
│   └── routes/         # Definição dos endpoints
│   └── server.js       # Ponto de entrada da aplicação
├── .env                # Variáveis de ambiente (local)
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore
├── docker-compose.yml  # Orquestração dos contêineres
├── Dockerfile          # Receita para construir a imagem da API
├── nodemon.json        # Configuração do Nodemon
└── package.json
```

## 👨‍💻 Autor

Feito por **Davi Costa Ferreira da Luz**.

- **LinkedIn:** [Davi Costa](https://www.linkedin.com/in/davi-costa-ferreira-da-luz-070b53216/)
- **GitHub:** [@dcfdl](https://github.com/dcfdl)
