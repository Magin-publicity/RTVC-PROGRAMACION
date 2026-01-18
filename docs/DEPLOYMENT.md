# Guía de Despliegue

## Despliegue en Producción

### Backend

1. **Configurar servidor:**
```bash
# Instalar Node.js y PostgreSQL
sudo apt update
sudo apt install nodejs npm postgresql
```

2. **Clonar repositorio:**
```bash
git clone [repository-url]
cd APP-PROGRAMACION-RTVC/backend
```

3. **Instalar dependencias:**
```bash
npm install --production
```

4. **Configurar variables de entorno:**
```bash
cp .env.example .env
nano .env
```
5. **Configurar base de datos:**
```bash
sudo -u postgres psql
CREATE DATABASE rtvc_scheduling;
\q

npm run db:setup
npm run db:seed
```

6. **Usar PM2 para mantener el servidor:**
```bash
npm install -g pm2
pm2 start server.js --name rtvc-api
pm2 save
pm2 startup
```

### Frontend

1. **Compilar aplicación:**
```bash
npm run build
```

2. **Configurar Nginx:**
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    root /var/www/rtvc-app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Copiar archivos:**
```bash
sudo cp -r dist/* /var/www/rtvc-app/
```

4. **Reiniciar Nginx:**
```bash
sudo systemctl restart nginx
```

## Despliegue con Docker

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: rtvc_scheduling
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_NAME: rtvc_scheduling
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Monitoreo

### Logs
```bash
# PM2
pm2 logs rtvc-api

# Docker
docker-compose logs -f

# Nginx
tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# API
curl http://localhost:3000/health

# Frontend
curl http://localhost
```