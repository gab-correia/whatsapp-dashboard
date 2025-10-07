FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 5173

# Comando padrão (dev mode)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
