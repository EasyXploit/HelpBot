# Basa el Dockerfile en la imagen oficial de Node.js 24 con Debian Bookworm
FROM node:24-bookworm-slim

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

# Guarda una copia de las configuraciones y bases de datos por defecto
RUN mkdir defaults && cp -r configs storage defaults/

# Inicializa los volúmenes con los archivos por defecto que falten antes de iniciar la aplicación
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]

# Inicia la aplicación
CMD ["tmux", "new-session", "-s", "helpbot", "npm start"]