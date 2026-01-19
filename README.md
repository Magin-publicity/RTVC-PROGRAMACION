# 📺 RTVC - Sistema de Coordinación y Programación

Sistema integral para la gestión de personal, coordinación de equipos técnicos, rutas, flota vehicular y alimentación del personal de RTVC (Radio Televisión Nacional de Colombia).

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ (recomendado: 20.x)
- npm 9+
- Base de datos PostgreSQL 14+

### Instalación

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# 4. Inicializar base de datos
npm run init-db
```

### Ejecutar en Desarrollo

```bash
# Opción 1: Script automático (Windows)
.\start-dev.ps1

# Opción 2: Manual
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA y puede instalarse en dispositivos móviles.

### Instalación en Móvil

1. **Desde el PC:** Asegúrate de que ambos servidores estén corriendo
2. **Desde el celular:** Abre Chrome y ve a: `http://[TU_IP]:5173`
3. **Instalar:** Menú ⋮ → "Agregar a pantalla principal"

📚 **Documentación completa:** [docs/pwa/](docs/pwa/)

---

## 📂 Estructura del Proyecto

```
RTVC PROGRAMACION/
├── backend/                    # API Node.js + Express
│   ├── db/                     # Configuración de base de datos
│   ├── routes/                 # Endpoints de la API
│   └── server.js               # Servidor principal
│
├── src/                        # Frontend React
│   ├── components/             # Componentes de React
│   │   ├── Assignments/        # Asignaciones de personal
│   │   ├── Auth/               # Autenticación
│   │   ├── Dashboard/          # Dashboard administrativo
│   │   ├── Fleet/              # Gestión de flota
│   │   ├── Layout/             # Layouts y navegación
│   │   ├── Logistics/          # Logística (LiveU, equipos)
│   │   ├── Meals/              # Gestión de alimentación
│   │   ├── Personnel/          # Gestión de personal
│   │   ├── Routes/             # Gestión de rutas
│   │   └── Schedule/           # Programación horaria
│   │
│   ├── config/                 # Configuración (API, constantes)
│   ├── data/                   # Datos estáticos y constantes
│   ├── hooks/                  # Custom React Hooks
│   ├── services/               # Servicios de API
│   ├── styles/                 # Estilos CSS globales
│   └── utils/                  # Utilidades y helpers
│
├── public/                     # Archivos estáticos
│   ├── icons/                  # Iconos PWA
│   ├── sw.js                   # Service Worker
│   └── manifest.json           # Manifest PWA
│
├── docs/                       # 📚 Documentación
│   ├── pwa/                    # Documentación PWA
│   ├── mobile/                 # Guías de acceso móvil
│   ├── modules/                # Documentación de módulos
│   └── setup/                  # Configuración y arquitectura
│
└── scripts/                    # Scripts de utilidad
    └── create-icons-from-logo.html
```

---

## 🎯 Funcionalidades Principales

### 1. 👥 Gestión de Personal
- Registro y administración de empleados
- Asignación de roles (Camarógrafos, Realizadores, Asistentes, Conductores, etc.)
- Control de turnos y disponibilidad
- Gestión de contratos (alertas de vencimiento)

### 2. 📅 Coordinación y Asignaciones
- **Asignación de Realizadores:** Control de disponibilidad por fecha
- **Reportería:** Coordinación de equipos técnicos (camarógrafos + asistentes)
- Visualización en tiempo real de disponibilidad
- Grupos de turnos (Mañana, Tarde, Noche)

### 3. 🚗 Gestión de Flota
- Registro de vehículos
- Despachos de vehículos por fecha
- Estados: Disponible, En Ruta, Mantenimiento
- Asignación de conductores

### 4. 📡 Logística
- **Equipos LiveU:** Control de transmisión en vivo
- Estados: Disponible, En Terreno, En Reparación
- Asignación a despachos

### 5. 🚌 Gestión de Rutas
- Creación de rutas de transporte
- Asignación de personal a rutas
- Control de horarios de salida/llegada
- Gestión de vehículos por ruta

### 6. 🍽️ Gestión de Alimentación
- Registro de consumo diario
- Asignación por turno
- Reportes de alimentación

### 7. 📊 Dashboard Administrativo
- Visualización en tiempo real de:
  - Disponibilidad de personal técnico
  - Estado de equipos LiveU
  - Flota vehicular
  - Novedades y alertas
- Contratos próximos a vencer
- Personal por área

### 8. 📈 Analytics (Reporte Inteligente)
- Generación de reportes PDF
- Estadísticas de:
  - Equipos más solicitados
  - Rutas más frecuentes
  - Camarógrafos más activos
  - Alertas y recomendaciones inteligentes
- Exportación de datos

---

## 📚 Documentación Detallada

### PWA y Móvil
- [Guía de Instalación PWA](docs/pwa/INSTALAR_PWA_BOTON.md)
- [Configuración Completa PWA](docs/pwa/PWA_COMPLETE_GUIDE.md)
- [Mejoras de UI Móvil](docs/mobile/MOBILE_UI_IMPROVEMENTS.md)
- [Fix Login Móvil](docs/mobile/FIX_LOGIN_MOVIL.md)
- [Fix Dashboard Móvil](docs/mobile/FIX_DASHBOARD_MOBILE.md)

### Módulos
- [Gestión de Rutas](docs/modules/GUIA_MODULO_RUTAS.md)
- [Gestión de Flota](docs/modules/INSTRUCTIVO_GESTION_DE_FLOTA.md)
- [Gestión de Alimentación](docs/modules/INSTRUCTIVO_GESTION_DE_ALIMENTACION.md)

### Configuración
- [Arquitectura de Red](docs/setup/NETWORK_ARCHITECTURE.md)
- [Integración Analytics](docs/setup/INTEGRACION_ANALYTICS.md)
- [URLs Corregidas](docs/setup/URLS_CORREGIDAS_RESUMEN.md)

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Socket.io Client** - WebSockets en tiempo real
- **html2pdf.js** - Generación de PDFs

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **Socket.io** - WebSockets en tiempo real
- **bcrypt** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT

---

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

- **Login:** `/api/auth/login`
- **Logout:** `/api/auth/logout`
- Token almacenado en localStorage
- Validación en cada petición

**Usuarios por defecto:**
- Admin: `admin` / `admin123`
- Coordinador: `coord` / `coord123`

---

## 🌐 Acceso desde Red Local

Para acceder desde dispositivos móviles en la misma red:

1. **Obtener IP local:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Configurar firewall:** Permitir puertos 3000 y 5173

3. **Desde el celular:** `http://[TU_IP]:5173`

📚 **Guía completa:** [docs/mobile/ACCESO_MOVIL_GUIA.md](docs/mobile/ACCESO_MOVIL_GUIA.md)

---

## 🐛 Troubleshooting

### Frontend no se conecta al Backend
- Verifica que ambos servidores estén corriendo
- Revisa que no haya URLs hardcodeadas con `localhost:3000`
- Todas las URLs deben ser relativas: `/api/...`

### PWA no se instala en móvil
- Verifica que existan: `public/icons/icon-192x192.png` y `icon-512x512.png`
- Deben ser PNG reales (> 5 KB), no SVG
- Limpia el cache del navegador móvil

### Service Worker no actualiza
- Elimina el SW: Chrome → `chrome://serviceworker-internals`
- Limpia cache: DevTools → Application → Clear storage
- Recarga con Ctrl+Shift+R

---

## 📝 Scripts Disponibles

```bash
# Frontend
npm run dev          # Desarrollo con Vite
npm run build        # Build para producción
npm run preview      # Preview del build

# Backend
cd backend
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run init-db      # Inicializar BD
```

---

## 🤝 Contribución

1. Crea un branch: `git checkout -b feature/nueva-funcionalidad`
2. Commit: `git commit -m "Agregar nueva funcionalidad"`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request

---

## 📄 Licencia

© 2026 RTVC - Radio Televisión Nacional de Colombia

---

## 📞 Soporte

Para reportar problemas o sugerencias:
- Email: soporte@rtvc.gov.co
- Tel: +57 (1) 2200700

---

## ✍️ Autores

- Juan Pablo Zorrilla - Productor Logístico

---

**Última actualización:** 2026-01-19
