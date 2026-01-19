# 🌐 Arquitectura de Red - Sistema RTVC

## 📊 Diagrama de Red Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / CLOUD                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Servicios Externos (CDN)                                   │   │
│  │  • https://cdnjs.cloudflare.com/html2pdf.js/0.10.1/        │   │
│  │  • WhatsApp Web API (https://web.whatsapp.com/send)        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                  ↕                                  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   ↕
                                   ↕ HTTPS (Producción)
                                   ↕ HTTP (Desarrollo)
                                   ↕
┌──────────────────────────────────┼──────────────────────────────────┐
│                    RED LOCAL / SERVIDOR                              │
│                                  ↕                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SERVIDOR DE DESARROLLO (localhost)              │   │
│  │                                                              │   │
│  │  ┌────────────────┐          ┌──────────────────┐          │   │
│  │  │  VITE SERVER   │◄────────►│  SERVICE WORKER  │          │   │
│  │  │  Port: 5173    │          │  (sw.js)         │          │   │
│  │  │                │          │                  │          │   │
│  │  │  • Hot Reload  │          │  Caches:         │          │   │
│  │  │  • React HMR   │          │  - rtvc-cache-v1 │          │   │
│  │  │  • PWA Assets  │          │  - rtvc-runtime  │          │   │
│  │  │                │          │  - rtvc-api      │          │   │
│  │  └────────┬───────┘          └──────────────────┘          │   │
│  │           │                                                 │   │
│  │           │ Static Assets (JS, CSS, HTML, SVG Icons)       │   │
│  │           │                                                 │   │
│  │           ↓                                                 │   │
│  │  ┌────────────────────────────────────────────────┐        │   │
│  │  │         FRONTEND (React + Vite)                │        │   │
│  │  │         http://localhost:5173                  │        │   │
│  │  │                                                 │        │   │
│  │  │  Components:                                   │        │   │
│  │  │  • Sidebar (+ Install Button)                 │        │   │
│  │  │  • MainLayout                                 │        │   │
│  │  │  • ScheduleTable                              │        │   │
│  │  │  • RoutesManagement                           │        │   │
│  │  │  • MealManagement                             │        │   │
│  │  │  • AdminDashboard                             │        │   │
│  │  │  • InstallPrompt (PWA)                        │        │   │
│  │  │                                                │        │   │
│  │  └────────────────┬───────────────────────────────┘        │   │
│  │                   │                                         │   │
│  └───────────────────┼─────────────────────────────────────────┘   │
│                      │                                             │
│                      │ HTTP/REST API Calls                         │
│                      │ WebSocket (Socket.io)                       │
│                      ↓                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              BACKEND SERVER (Express + Node.js)              │   │
│  │              http://localhost:3000                           │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  API REST Endpoints                                   │  │   │
│  │  │                                                        │  │   │
│  │  │  /api/auth/*           - Autenticación               │  │   │
│  │  │  /api/personnel/*      - Gestión de Personal         │  │   │
│  │  │  /api/schedule/*       - Programación                │  │   │
│  │  │  /api/routes/*         - Gestión de Rutas            │  │   │
│  │  │  /api/fleet/*          - Gestión de Flota            │  │   │
│  │  │  /api/meals/*          - Gestión de Alimentación     │  │   │
│  │  │  /api/novelties/*      - Novedades                   │  │   │
│  │  │  /api/program-mapping/* - Mapeo de Programas         │  │   │
│  │  │  /api/reports/*        - Reportes                    │  │   │
│  │  │                                                        │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  WEBSOCKET SERVER (Socket.io)                        │  │   │
│  │  │                                                        │  │   │
│  │  │  Events:                                              │  │   │
│  │  │  • schedule:update     - Actualizar programación     │  │   │
│  │  │  • route:update        - Actualizar rutas            │  │   │
│  │  │  • meal:update         - Actualizar comidas          │  │   │
│  │  │  • connection          - Conexión establecida        │  │   │
│  │  │  • disconnect          - Desconexión                 │  │   │
│  │  │                                                        │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │                             ↕                                │   │
│  │                  SQL/PostgreSQL Queries                      │   │
│  │                             ↕                                │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │         BASE DE DATOS (PostgreSQL)                    │  │   │
│  │  │         Port: 5432 (default)                          │  │   │
│  │  │                                                        │  │   │
│  │  │  Tablas:                                              │  │   │
│  │  │  • users               - Usuarios del sistema        │  │   │
│  │  │  • personnel           - Personal RTVC               │  │   │
│  │  │  • schedules           - Programaciones              │  │   │
│  │  │  • schedule_assignments - Asignaciones              │  │   │
│  │  │  • routes              - Rutas de transporte         │  │   │
│  │  │  • vehicles            - Vehículos de la flota       │  │   │
│  │  │  • meals               - Solicitudes de comida       │  │   │
│  │  │  • novelties           - Novedades del personal      │  │   │
│  │  │  • program_mappings    - Mapeo programas/recursos    │  │   │
│  │  │  • custom_programs     - Programas personalizados    │  │   │
│  │  │  • change_logs         - Historial de cambios        │  │   │
│  │  │                                                        │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   ↕
                                   ↕
┌──────────────────────────────────┼──────────────────────────────────┐
│                    DISPOSITIVOS CLIENTE                              │
│                                  ↕                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Desktop   │  │   Laptop    │  │   Tablet    │  │  Móvil    │ │
│  │   Chrome    │  │   Edge      │  │   Safari    │  │  Chrome   │ │
│  │             │  │             │  │             │  │           │ │
│  │  • PWA OK   │  │  • PWA OK   │  │  • PWA OK   │  │ • PWA OK  │ │
│  │  • Offline  │  │  • Offline  │  │  • Offline  │  │ • Offline │ │
│  │  • Sync     │  │  • Sync     │  │  • Sync     │  │ • Sync    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Flujo de Datos Detallado

### 1. **Flujo de Autenticación**

```
Usuario → Login Page
         ↓
         POST /api/auth/login
         {email, password}
         ↓
Backend → Validación en DB
         ↓
         SELECT * FROM users WHERE email = ?
         ↓
         JWT Token generado
         ↓
Response ← {token, user}
         ↓
Frontend → localStorage.setItem('token', token)
         → Redirect a Dashboard
```

---

### 2. **Flujo de Programación (Schedule)**

```
Usuario abre Programación
         ↓
GET /api/schedule/:date
         ↓
Backend → SELECT * FROM schedules WHERE date = ?
         → SELECT * FROM schedule_assignments WHERE schedule_id = ?
         ↓
Response ← {schedule, assignments, callTimes}
         ↓
Frontend → Renderiza ScheduleTable
         ↓
Usuario edita asignación
         ↓
PUT /api/schedule/:id/assignment
{personnel_id, program_id, assigned: true}
         ↓
Backend → UPDATE schedule_assignments SET ...
         → INSERT INTO change_logs ...
         ↓
WebSocket → Emit 'schedule:update' a todos los clientes
         ↓
Otros clientes → Reciben actualización en tiempo real
```

---

### 3. **Flujo de Rutas (Routes)**

```
Usuario abre Gestión de Rutas
         ↓
GET /api/routes?date=YYYY-MM-DD&shift=DIA
         ↓
Backend → SELECT r.*, v.plate, v.driver
          FROM routes r
          LEFT JOIN vehicles v ON r.vehicle_id = v.id
         ↓
Response ← [{route_id, passengers, vehicle, driver}]
         ↓
Frontend → Renderiza RoutesManagement
         ↓
Usuario asigna vehículo
         ↓
PUT /api/routes/:id/assign-vehicle
{vehicle_id: 5}
         ↓
Backend → UPDATE routes SET vehicle_id = 5 WHERE id = ?
         ↓
WebSocket → Emit 'route:update'
         ↓
Frontend → Actualiza vista automáticamente
```

---

### 4. **Flujo de Compartir WhatsApp**

```
Usuario hace click en "Compartir WhatsApp"
         ↓
Frontend → generateVehicleDispatchMessage(dispatch)
         → Construye mensaje con formato
         ↓
         → navigator.share() (Móvil)
         → window.open('https://wa.me/?text=...') (Desktop)
         ↓
WhatsApp Web/App → Abre con mensaje pre-llenado
```

---

### 5. **Flujo de Instalación PWA**

```
Usuario abre la app por primera vez
         ↓
Service Worker → Register en background
         ↓
         → Cachea recursos estáticos
         → Cachea manifest.json
         → Cachea iconos
         ↓
Browser → Dispara evento 'beforeinstallprompt'
         ↓
Sidebar → Captura evento
         → Muestra botón "Instalar App RTVC"
         ↓
Usuario hace click
         ↓
deferredPrompt.prompt()
         ↓
Browser → Muestra diálogo nativo de instalación
         ↓
Usuario acepta
         ↓
         → App se agrega a Home Screen / Escritorio
         → Icono RTVC visible
         → Ejecuta en modo standalone (sin barra del navegador)
```

---

### 6. **Flujo Offline (Sin Internet)**

```
Usuario pierde conexión a internet
         ↓
Frontend → Intenta fetch('/api/schedule/2026-01-20')
         ↓
Network Error
         ↓
Service Worker → Intercepta fetch
         ↓
         → Busca en Cache 'rtvc-api-v1'
         ↓
         → Encuentra respuesta cacheada
         ↓
Response ← Datos desde cache
         ↓
Frontend → Renderiza con datos offline
         → Muestra badge "Offline" (opcional)
         ↓
Conexión se restaura
         ↓
Service Worker → Sincroniza cambios pendientes
         → Actualiza cache con datos frescos
```

---

## 🔐 Seguridad de Red

### Headers de Seguridad (Backend)

```javascript
// Backend: server.js
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://rtvc.app'],
  credentials: true
}));

// JWT Authentication
app.use('/api/*', authenticateToken);

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

### HTTPS en Producción

```nginx
# Nginx Configuration
server {
  listen 443 ssl http2;
  server_name rtvc.app;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass http://localhost:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

---

## 📊 Puertos y Servicios

| Servicio | Puerto | Protocolo | Descripción |
|----------|--------|-----------|-------------|
| **Frontend (Vite)** | 5173 | HTTP/WS | Servidor de desarrollo con HMR |
| **Backend (Express)** | 3000 | HTTP/WS | API REST + Socket.io |
| **PostgreSQL** | 5432 | TCP | Base de datos |
| **Service Worker** | - | - | Corre en el navegador |

---

## 🌍 URLs y Endpoints

### Frontend URLs

```
http://localhost:5173/                    # Dashboard
http://localhost:5173/schedule            # Programación
http://localhost:5173/routes              # Rutas
http://localhost:5173/meals               # Alimentación
http://localhost:5173/program-mapping     # Mapeo de Programas
```

### Backend Endpoints

#### Autenticación
```
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/verify             # Verificar token
```

#### Personal
```
GET    /api/personnel               # Listar todo el personal
POST   /api/personnel               # Crear personal
PUT    /api/personnel/:id           # Actualizar personal
DELETE /api/personnel/:id           # Eliminar personal
```

#### Programación
```
GET    /api/schedule/:date          # Obtener programación de fecha
POST   /api/schedule                # Crear programación
PUT    /api/schedule/:id            # Actualizar programación
PUT    /api/schedule/:id/assignment # Actualizar asignación
POST   /api/schedule/:id/regenerate # Regenerar turnos
```

#### Rutas
```
GET    /api/routes?date=X&shift=Y   # Obtener rutas por fecha/turno
POST   /api/routes                  # Crear ruta
PUT    /api/routes/:id               # Actualizar ruta
PUT    /api/routes/:id/assign-vehicle # Asignar vehículo
DELETE /api/routes/:id               # Eliminar ruta
```

#### Alimentación
```
GET    /api/meals?date=X&service=Y  # Obtener solicitudes
POST   /api/meals                   # Crear solicitud
PUT    /api/meals/:id                # Actualizar solicitud
DELETE /api/meals/:id                # Eliminar solicitud
```

#### Mapeo de Programas
```
GET    /api/program-mapping          # Obtener todos los mapeos
POST   /api/program-mapping          # Crear mapeo
PUT    /api/program-mapping/:id      # Actualizar mapeo
DELETE /api/program-mapping/:id      # Eliminar mapeo
```

---

## 🔄 WebSocket Events

### Cliente → Servidor

```javascript
socket.emit('join:schedule', { date: '2026-01-20' });
socket.emit('join:routes', { date: '2026-01-20', shift: 'DIA' });
```

### Servidor → Cliente

```javascript
socket.on('schedule:update', (data) => {
  // data: {schedule_id, assignments, callTimes}
  // Actualizar estado local
});

socket.on('route:update', (data) => {
  // data: {route_id, vehicle_id, driver}
  // Actualizar vista de rutas
});

socket.on('meal:update', (data) => {
  // data: {meal_id, status}
  // Actualizar vista de comidas
});
```

---

## 💾 Estrategia de Cache

### Service Worker Caching

```javascript
// Nivel 1: Static Assets (Cache First)
Recursos: JS, CSS, Images, Fonts
Estrategia: Buscar en cache primero, luego red
Cache: rtvc-cache-v1

// Nivel 2: API Calls (Network First)
Recursos: /api/*
Estrategia: Intentar red primero, fallback a cache
Cache: rtvc-api-v1

// Nivel 3: Runtime (On Demand)
Recursos: Otros recursos dinámicos
Estrategia: Cachear bajo demanda
Cache: rtvc-runtime-v1
```

---

## 📱 Sincronización Multi-dispositivo

```
Dispositivo A (Desktop) → Actualiza programación
         ↓
POST /api/schedule/123/assignment
         ↓
Backend → Guarda en DB
         ↓
         → socket.emit('schedule:update', data) a TODOS
         ↓
Dispositivo B (Móvil) → Recibe evento WebSocket
         ↓
         → Actualiza UI automáticamente
         ↓
Dispositivo C (Tablet) → Recibe evento WebSocket
         ↓
         → Actualiza UI automáticamente
```

---

## 🚀 Rendimiento y Optimización

### Latencia Esperada

| Operación | Latencia |
|-----------|----------|
| GET /api/schedule | < 100ms |
| PUT /api/schedule/assignment | < 200ms |
| WebSocket update | < 50ms |
| Service Worker cache hit | < 10ms |
| Cache miss + network | 100-500ms |

### Ancho de Banda

| Recurso | Tamaño |
|---------|--------|
| HTML inicial | ~5KB |
| JS Bundle (Vite) | ~300-500KB |
| CSS | ~50KB |
| Iconos SVG | ~2KB cada uno |
| API Response (schedule) | ~10-50KB |
| WebSocket mensaje | < 1KB |

---

## 🎯 Resumen de Red

**Arquitectura:** Client-Server con WebSockets

**Protocolos:** HTTP/HTTPS, WebSocket (Socket.io), TCP/IP

**Puertos:**
- Frontend: 5173
- Backend: 3000
- DB: 5432

**Seguridad:**
- JWT para autenticación
- CORS habilitado
- HTTPS en producción
- Helmet.js para headers de seguridad

**Offline Support:**
- Service Worker con estrategia Network First
- Cache API para recursos y API responses
- Sincronización automática al recuperar conexión

**Real-time:**
- Socket.io para actualizaciones en tiempo real
- Sincronización multi-dispositivo
- Notificaciones de cambios instantáneas

---

¡Tu red está diseñada para ser rápida, segura y funcionar offline! 🚀
