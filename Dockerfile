# Use uma imagem base oficial do Node.js
FROM node:18-alpine

# Crie e defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependência
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o resto do código da aplicação
COPY . .

# Exponha a porta que a aplicação vai rodar
EXPOSE 3000

# O comando para iniciar a aplicação quando o contêiner rodar
CMD ["npm", "run", "dev"]