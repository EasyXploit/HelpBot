# Basa el Dockerfile en la imagen oficial de Node.js 20 con Debian Bookworm
FROM node:20-bookworm-slim

# Instala las herramientas de compilación para dependencias nativas y TMUX
RUN apt-get update && apt-get install -y --no-install-recommends \
    tmux \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los manifiestos e instala las dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código del proyecto
COPY . .

# Inicia la aplicación
CMD ["tmux", "new-session", "-s", "helpbot", "npm start"]
