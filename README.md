# Sistema de Programación RTVC

Sistema automatizado para la gestión de programación de personal de RTVC.

## 📚 Documentación

- **[Guía Rápida](docs/GUIA-RAPIDA.md)** - ¡Empieza aquí! 5 minutos para entender todo
- **[Arquitectura del Sistema](docs/ARQUITECTURA.md)** - Documentación completa de la arquitectura
- **[Diagramas Visuales](docs/DIAGRAMAS.md)** - Diagramas de flujo y estructura
- **[API Reference](docs/API.md)** - Documentación de la API REST
- **[Guía de Despliegue](docs/DEPLOYMENT.md)** - Instrucciones para producción

## ✨ Características

- 📅 Gestión de programación semanal
- 👥 Administración de personal por áreas
- 🔔 Gestión de novedades (viajes, incapacidades, permisos, etc.)
- 🔄 Rotación automática de turnos (ciclo de 4 semanas)
- 📊 Generación de reportes en Excel y PDF
- 📱 Interfaz responsive y moderna
- 🌐 Sistema de turnos diferenciados para fin de semana

## Tecnologías

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (iconos)

### Backend
- Node.js
- Express
- PostgreSQL
- pg (node-postgres)

## Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Crear la base de datos:
```bash
psql -U postgres -c "CREATE DATABASE rtvc_scheduling;"
```

5. Ejecutar migraciones:
```bash
npm run db:setup
npm run db:seed
```

6. Iniciar servidor:
```bash
npm run dev
```

### Frontend

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con la URL del backend
```

3. Iniciar aplicación:
```bash
npm run dev
```

4. Abrir en el navegador:
```
http://localhost:5173
```

## Estructura del Proyecto
```
APP-PROGRAMACION-RTVC/
├── backend/
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores
│   ├── database/         # Migraciones y seeds
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas API
│   ├── utils/            # Utilidades
│   └── server.js         # Servidor principal
├── src/
│   ├── components/       # Componentes React
│   ├── data/             # Datos estáticos
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios API
│   ├── styles/           # Estilos globales
│   ├── utils/            # Utilidades
│   └── App.jsx           # Componente principal
└── public/               # Archivos estáticos
```

## Uso

### Gestión de Personal

1. Ir a la sección "Personal"
2. Hacer clic en "Agregar Personal"
3. Completar formulario con:
   - Nombre completo
   - Área de trabajo
   - Rol
   - Turno actual
   - Datos de contacto

### Crear Programación

1. Ir a "Programación"
2. Seleccionar semana
3. Hacer clic en "Generar Programación"
4. El sistema asigna automáticamente:
   - Turnos rotativos
   - Personal por área
   - Horarios según programas

### Agregar Novedades

1. Ir a "Novedades"
2. Hacer clic en "Agregar Novedad"
3. Seleccionar:
   - Personal
   - Fecha
   - Tipo de novedad
   - Descripción

### Generar Reportes

1. Ir a "Reportes"
2. Seleccionar:
   - Tipo de reporte
   - Rango de fechas
3. Hacer clic en "Generar"
4. Exportar en formato deseado

## Rotación de Turnos

El sistema maneja 5 turnos principales que rotan semanalmente:
- 5:00 AM
- 8:00 AM
- 11:00 AM
- 2:00 PM
- 5:00 PM

Cada semana, el personal avanza al siguiente turno en el ciclo.

## Tipos de Novedades

- ✈️ Viaje
- 🏥 Incapacidad
- 💔 Tragedia Familiar
- 🏖️ Vacaciones
- 📄 Sin Contrato
- 📋 Permiso
- ✅ Disponible
- ✍️ Redacción
- 🎬 Estudio 3
- 🎛️ Master 3
- 🔧 Taller
- 👥 Dupla
- 📡 Live U

## Áreas de Personal

1. **PRODUCCIÓN** - Productores y asistentes
2. **DIRECTORES DE CÁMARA** - Directores técnicos
3. **VTR** - Operadores de VTR
4. **VMIX Y PANTALLAS** - Operadores técnicos
5. **GENERADORES DE CARACTERES** - Diseñadores
6. **OPERADORES DE AUDIO** - Técnicos de sonido
7. **OPERADORES DE PROMPTER** - Operadores
8. **CAMARÓGRAFOS DE ESTUDIO** - Camarógrafos y asistentes
9. **COORDINADOR ESTUDIO** - Coordinación
10. **ESCENOGRAFÍA** - Escenógrafos y asistentes
11. **ASISTENTES DE LUCES** - Técnicos de iluminación
12. **OPERADORES DE VIDEO** - Operadores
13. **CONTRIBUCIONES** - Personal de enlaces
14. **CAMARÓGRAFOS DE REPORTERÍA** - Reporteros y realizadores
15. **VESTUARIO** - Vestuaristas
16. **MAQUILLAJE** - Maquilladores

## API Endpoints

### Personal
- GET `/api/personnel` - Obtener todo el personal
- GET `/api/personnel/:id` - Obtener persona por ID
- GET `/api/personnel/area/:area` - Obtener por área
- POST `/api/personnel` - Crear persona
- PUT `/api/personnel/:id` - Actualizar persona
- PATCH `/api/personnel/:id/shift` - Actualizar turno
- DELETE `/api/personnel/:id` - Eliminar persona

### Programación
- GET `/api/schedule/date/:date` - Obtener por fecha
- GET `/api/schedule/week?startDate=&endDate=` - Obtener semana
- POST `/api/schedule` - Crear programación
- POST `/api/schedule/bulk` - Crear múltiples
- DELETE `/api/schedule/:id` - Eliminar programación

### Novedades
- GET `/api/novelties` - Obtener todas
- GET `/api/novelties/date/:date` - Obtener por fecha
- GET `/api/novelties/personnel/:id` - Obtener por persona
- GET `/api/novelties/range?startDate=&endDate=` - Obtener rango
- POST `/api/novelties` - Crear novedad
- PUT `/api/novelties/:id` - Actualizar novedad
- DELETE `/api/novelties/:id` - Eliminar novedad

## Desarrollo

### Scripts disponibles
```bash
# Frontend
npm run dev          # Iniciar desarrollo
npm run build        # Compilar producción
npm run preview      # Vista previa producción
npm run lint         # Ejecutar linter

# Backend
npm start            # Iniciar producción
npm run dev          # Iniciar desarrollo
npm run db:setup     # Configurar base de datos
npm run db:seed      # Insertar datos iniciales
```

### Agregar nuevo componente
```bash
# Crear archivo
touch src/components/MiComponente/MiComponente.jsx

# Importar y usar
import { MiComponente } from './components/MiComponente/MiComponente';
```

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es propiedad de RTVC.

## Soporte

Para soporte técnico, contactar a:
- Email: soporte@rtvc.gov.co
- Tel: +57 (1) 2200700

## Autores

- Equipo de Desarrollo RTVC

---

Desarrollado con ❤️ para RTVC