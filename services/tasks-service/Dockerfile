FROM node:18-alpine

# Instalar wget para health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./

# Instalar dependências (usando npm install pois não há package-lock.json)
RUN npm install --omit=dev

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Iniciar aplicação
CMD ["node", "server.js"]

