# Arquitectura del Sistema de Programación RTVC

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura Backend](#arquitectura-backend)
5. [Arquitectura Frontend](#arquitectura-frontend)
6. [Base de Datos](#base-de-datos)
7. [Flujo de Datos](#flujo-de-datos)
8. [Componentes Principales](#componentes-principales)

---

## Visión General

Sistema web para gestionar la programación y asignación de personal de RTVC, con rotación automática de turnos, gestión de novedades y generación de reportes.

### Características Principales

- ✅ Programación automática de turnos con rotación de 4 semanas
- ✅ Gestión de personal por áreas
- ✅ Sistema de novedades (vacaciones, incapacidades, permisos)
- ✅ Diferentes turnos para días entre semana y fin de semana
- ✅ Exportación a PDF y Excel
- ✅ Interfaz intuitiva y responsive

---

## Estructura del Proyecto

```
RTVC PROGRAMACION/
│
├── backend/                    # Servidor Node.js + Express
│   ├── config/                 # Configuraciones
│   │   └── database.js         # Configuración de PostgreSQL
│   │
│   ├── controllers/            # Lógica de negocio
│   │   ├── noveltyController.js
│   │   ├── personnelController.js
│   │   ├── reportController.js
│   │   └── scheduleController.js
│   │
│   ├── database/               # Scripts SQL
│   │   ├── schema.sql          # Estructura de tablas
│   │   ├── seeds.sql           # Datos iniciales
│   │   ├── init.sql            # Inicialización
│   │   └── migrate-*.sql       # Migraciones
│   │
│   ├── models/                 # Modelos de datos
│   │   ├── Novelty.js
│   │   ├── Personnel.js
│   │   ├── RotationPattern.js
│   │   └── Schedule.js
│   │
│   ├── routes/                 # Rutas de la API
│   │   ├── novelty.js          # /api/novelties
│   │   ├── personnel.js        # /api/personnel
│   │   ├── report.js           # /api/reports
│   │   └── schedule.js         # /api/schedule
│   │
│   ├── scripts/                # Utilidades
│   │   ├── utils/              # Scripts de verificación
│   │   ├── migrations/         # Scripts de migración
│   │   └── README.md           # Documentación de scripts
│   │
│   ├── .env                    # Variables de entorno
│   ├── package.json            # Dependencias backend
│   └── server.js               # Punto de entrada
│
├── src/                        # Frontend React
│   ├── components/             # Componentes React
│   │   ├── Calendar/           # Componentes de calendario
│   │   ├── Layout/             # Layout y navegación
│   │   ├── Novelties/          # Gestión de novedades
│   │   ├── Personnel/          # Gestión de personal
│   │   ├── Reports/            # Generación de reportes
│   │   ├── Schedule/           # Tabla de programación
│   │   └── UI/                 # Componentes reutilizables
│   │
│   ├── data/                   # Datos estáticos
│   │   ├── departments.js
│   │   ├── novelties.js
│   │   ├── programs.js
│   │   └── shifts.js
│   │
│   ├── hooks/                  # React Hooks personalizados
│   │   ├── useLocalStorage.js
│   │   ├── useNovelties.js
│   │   ├── usePersonnel.js
│   │   ├── useSchedule.js
│   │   └── useWeekNavigation.js
│   │
│   ├── services/               # Servicios de API
│   │   ├── api.js              # Cliente HTTP base
│   │   ├── noveltyService.js
│   │   ├── personnelService.js
│   │   └── scheduleService.js
│   │
│   ├── utils/                  # Utilidades
│   │   ├── dateUtils.js        # Manipulación de fechas
│   │   ├── exportToExcel.js    # Exportación Excel
│   │   ├── exportToPDF.js      # Exportación PDF
│   │   ├── pdfGenerator.js     # Generador de PDF
│   │   ├── scheduleGenerator.js
│   │   └── shiftRotation.js
│   │
│   ├── App.jsx                 # Componente principal
│   └── main.jsx                # Punto de entrada
│
├── docs/                       # Documentación
│   ├── API.md                  # Documentación de API
│   ├── ARQUITECTURA.md         # Este archivo
│   ├── DEPLOYMENT.md           # Guía de despliegue
│   └── personnel_structure.txt
│
├── index.html                  # HTML principal
├── package.json                # Dependencias frontend
├── vite.config.js              # Configuración Vite
├── tailwind.config.js          # Configuración Tailwind
└── README.md                   # Documentación general
```

---

## Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **pg** - Cliente PostgreSQL para Node.js
- **CORS** - Manejo de peticiones cross-origin

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **jsPDF** - Generación de PDFs
- **ExcelJS** - Exportación a Excel

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **PostCSS** - Procesamiento de CSS

---

## Arquitectura Backend

### Patrón MVC (Modelo-Vista-Controlador)

```
Cliente (Frontend)
    ↓
Routes (Rutas)
    ↓
Controllers (Controladores)
    ↓
Models (Modelos)
    ↓
Database (PostgreSQL)
```

### 1. Server.js (Punto de Entrada)

```javascript
// Configuración del servidor Express
const express = require('express');
const cors = require('cors');

// Importar rutas
const personnelRoutes = require('./routes/personnel');
const scheduleRoutes = require('./routes/schedule');
const noveltyRoutes = require('./routes/novelty');
const reportRoutes = require('./routes/report');

// Configurar middleware
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use('/api/personnel', personnelRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/novelties', noveltyRoutes);
app.use('/api/reports', reportRoutes);
```

### 2. Routes (Rutas)

Define los endpoints de la API:

```javascript
// backend/routes/personnel.js
router.get('/', personnelController.getAll);
router.post('/', personnelController.create);
router.put('/:id', personnelController.update);
router.delete('/:id', personnelController.delete);
```

### 3. Controllers (Controladores)

Contienen la lógica de negocio:

```javascript
// backend/controllers/personnelController.js
exports.getAll = async (req, res) => {
  try {
    const personnel = await Personnel.findAll();
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 4. Models (Modelos)

Interactúan con la base de datos:

```javascript
// backend/models/Personnel.js
class Personnel {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM personnel WHERE active = true ORDER BY area, name'
    );
    return result.rows;
  }
}
```

### API Endpoints Principales

```
GET    /api/personnel              - Obtener todo el personal
POST   /api/personnel              - Crear nuevo personal
PUT    /api/personnel/:id          - Actualizar personal
DELETE /api/personnel/:id          - Eliminar personal

GET    /api/schedule/rotation-week - Obtener semana de rotación actual
GET    /api/schedule/auto-shifts/:date - Obtener turnos automáticos
GET    /api/schedule/calendar      - Obtener calendario completo
POST   /api/schedule               - Crear horario

GET    /api/novelties              - Obtener novedades
POST   /api/novelties              - Crear novedad
PUT    /api/novelties/:id          - Actualizar novedad
DELETE /api/novelties/:id          - Eliminar novedad

GET    /api/reports/schedule       - Generar reporte de programación
```

---

## Arquitectura Frontend

### Patrón de Componentes React

```
App.jsx (Componente Principal)
    ↓
MainLayout (Layout)
    ↓
Pages/Views (Vistas)
    ↓
Components (Componentes)
    ↓
Hooks (Lógica reutilizable)
    ↓
Services (API)
```

### 1. App.jsx (Componente Principal)

```javascript
function App() {
  const [activeView, setActiveView] = useState('schedule');

  // Hooks personalizados
  const { currentDate, goToNextWeek, goToPreviousWeek } = useWeekNavigation();
  const { personnel, addPerson, updatePerson } = usePersonnel();
  const { schedule, generateSchedule } = useSchedule(currentDate);
  const { novelties, addNovelty } = useNovelties();

  // Renderizar vista activa
  return (
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </MainLayout>
  );
}
```

### 2. Hooks Personalizados

**usePersonnel.js** - Gestión de personal
```javascript
export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPersonnel = async () => {
    const data = await personnelService.getAll();
    setPersonnel(data);
  };

  return { personnel, loading, addPerson, updatePerson, deletePerson };
};
```

**useSchedule.js** - Gestión de horarios
```javascript
export const useSchedule = (currentDate) => {
  const [schedule, setSchedule] = useState({});

  const generateSchedule = async (personnel, date, novelties) => {
    // Lógica de generación de horarios
  };

  return { schedule, loading, generateSchedule };
};
```

**useNovelties.js** - Gestión de novedades
```javascript
export const useNovelties = () => {
  const [novelties, setNovelties] = useState([]);

  const addNovelty = async (noveltyData) => {
    const newNovelty = await noveltyService.create(noveltyData);
    setNovelties([...novelties, newNovelty]);
  };

  return { novelties, addNovelty, updateNovelty, deleteNovelty };
};
```

### 3. Services (Servicios)

Manejan las llamadas a la API:

```javascript
// src/services/api.js
const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};
```

### 4. Estructura de Componentes

```
src/components/
│
├── Calendar/
│   ├── Calendar.jsx           - Selector de calendario mensual
│   ├── DatePicker.jsx         - Selector de fecha individual
│   └── WeekSelector.jsx       - Selector de semana
│
├── Layout/
│   ├── Header.jsx             - Encabezado de la aplicación
│   ├── Sidebar.jsx            - Menú lateral
│   ├── Footer.jsx             - Pie de página
│   └── MainLayout.jsx         - Layout principal
│
├── Novelties/
│   ├── NoveltyBadge.jsx       - Indicador visual de novedad
│   ├── NoveltyForm.jsx        - Formulario de novedad
│   ├── NoveltyList.jsx        - Lista de novedades
│   └── NoveltyModal.jsx       - Modal para novedades
│
├── Personnel/
│   ├── PersonnelCard.jsx      - Tarjeta de personal
│   ├── PersonnelForm.jsx      - Formulario de personal
│   ├── PersonnelList.jsx      - Lista de personal
│   └── PersonnelModal.jsx     - Modal para personal
│
├── Reports/
│   ├── ExportOptions.jsx      - Opciones de exportación
│   ├── ReportGenerator.jsx    - Generador de reportes
│   └── ReportPreview.jsx      - Vista previa de reporte
│
├── Schedule/
│   ├── ProgramHeader.jsx      - Encabezado de programas
│   ├── ScheduleCell.jsx       - Celda de programación
│   ├── ScheduleGrid.jsx       - Grilla de programación
│   ├── ScheduleRow.jsx        - Fila de programación
│   └── ScheduleTable.jsx      - Tabla principal de programación
│
└── UI/
    ├── Alert.jsx              - Componente de alerta
    ├── Button.jsx             - Botón reutilizable
    ├── Input.jsx              - Input reutilizable
    ├── Loading.jsx            - Indicador de carga
    ├── Modal.jsx              - Modal reutilizable
    └── Select.jsx             - Select reutilizable
```

---

## Base de Datos

### Modelo de Datos

```sql
-- Tabla de Personal
personnel
├── id (PK)
├── name
├── role
├── area
├── current_shift
├── active
├── created_at
└── updated_at

-- Tabla de Novedades
novelties
├── id (PK)
├── personnel_id (FK)
├── start_date
├── end_date
├── type (vacaciones, incapacidad, permiso, etc.)
├── description
└── created_at

-- Tabla de Horarios
schedules
├── id (PK)
├── personnel_id (FK)
├── date
├── shift_start
├── shift_end
├── program_id
└── created_at

-- Tabla de Patrones de Rotación
rotation_patterns
├── id (PK)
├── area
├── week_number (1-4)
├── shift_start
├── shift_end
└── created_at

-- Tabla de Configuración de Rotación
rotation_config
├── id (PK)
├── current_week (1-4)
├── week_start_date
└── updated_at
```

### Relaciones

```
personnel 1 ──── N novelties
personnel 1 ──── N schedules
area 1 ──── N rotation_patterns
```

---

## Flujo de Datos

### 1. Flujo de Carga de Programación

```
Usuario selecciona fecha
    ↓
Frontend: useSchedule.js
    ↓
API: GET /api/schedule/auto-shifts/:date
    ↓
Backend: scheduleController.js
    ↓
Calcula semana de rotación (ciclo 1-4)
    ↓
Verifica si es fin de semana
    ↓
┌─────────────────┬─────────────────┐
│  Fin de Semana  │  Entre Semana   │
├─────────────────┼─────────────────┤
│ 2 turnos fijos: │ Consulta        │
│ 08:00-14:00     │ rotation_patterns│
│ 14:00-20:00     │ según semana    │
│                 │ actual (1-4)    │
│ 2 personas por  │ Rota turnos     │
│ área            │ automáticamente │
└─────────────────┴─────────────────┘
    ↓
Obtiene novedades activas
    ↓
Aplica filtros (excluye personal con novedades)
    ↓
Retorna turnos asignados
    ↓
Frontend: ScheduleTable.jsx renderiza
```

### 2. Flujo de Creación de Novedad

```
Usuario crea novedad
    ↓
Frontend: NoveltyForm.jsx
    ↓
Valida datos (fechas, tipo, personal)
    ↓
API: POST /api/novelties
    ↓
Backend: noveltyController.create
    ↓
Valida que las fechas sean correctas
    ↓
Inserta en tabla novelties
    ↓
Retorna novedad creada
    ↓
Frontend: actualiza lista de novedades
    ↓
Recalcula programación automáticamente
```

### 3. Flujo de Rotación de Turnos

```
Sistema calcula semana de rotación
    ↓
Fecha base: 10 de noviembre 2025 = Semana 1
    ↓
Calcula diferencia en días desde fecha base
    ↓
Divide entre 7 para obtener semanas
    ↓
Aplica módulo 4: (semanas % 4) + 1
    ↓
Resultado: Semana 1, 2, 3 o 4
    ↓
Consulta rotation_patterns WHERE week_number = semana_calculada
    ↓
Asigna turnos según patrones de esa semana
    ↓
Cada persona rota automáticamente cada semana
```

---

## Componentes Principales

### 1. ScheduleTable.jsx

**Responsabilidad**: Renderizar la tabla de programación principal

**Características**:
- Muestra personal agrupado por área
- Renderiza programas del día
- Asigna automáticamente según turnos
- Muestra novedades en rojo
- Permite edición manual de asignaciones

**Lógica clave**:
```javascript
// Determinar programas según día
const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
const programs = isWeekend ? WEEKEND_PROGRAMS : WEEKDAY_PROGRAMS;

// Cargar turnos automáticos
const dateStr = formatLocalDate(selectedDate); // IMPORTANTE: formato local
const shifts = await fetch(`/api/schedule/auto-shifts/${dateStr}`);

// Buscar novedades activas
const todayNovelty = novelties.find(n => {
  const todayStr = formatLocalDate(selectedDate);
  if (n.start_date && n.end_date) {
    return todayStr >= n.start_date && todayStr <= n.end_date;
  }
});
```

### 2. NoveltyModal.jsx

**Responsabilidad**: Crear y editar novedades

**Características**:
- Formulario de rango de fechas (start_date, end_date)
- Selector de tipo de novedad
- Selector de personal
- Validación de fechas

**Validaciones**:
- La fecha de fin debe ser >= fecha de inicio
- No permitir crear novedades en el pasado
- Verificar que el personal exista

### 3. useWeekNavigation.js

**Responsabilidad**: Gestionar navegación entre semanas

**Métodos**:
```javascript
{
  currentDate,        // Fecha actual seleccionada
  weekNumber,         // Número de semana del año
  goToNextWeek(),     // Avanzar una semana
  goToPreviousWeek(), // Retroceder una semana
  goToWeek(date),     // Ir a una fecha específica
  goToToday()         // Volver al día de hoy
}
```

### 4. dateUtils.js

**Responsabilidad**: Utilidades para manipulación de fechas

**Funciones importantes**:
```javascript
formatDate(date)           // YYYY-MM-DD
formatDateLong(date)       // "Lunes 10 de diciembre de 2025"
isWeekend(date)            // true si es sábado o domingo
getWeekDates(date)         // Array de 7 días de la semana
addDays(date, days)        // Agregar días a una fecha
```

**⚠️ Importante**: Todas las funciones manejan fechas en zona horaria local para evitar problemas con UTC.

---

## Consideraciones Técnicas Importantes

### 1. Manejo de Zonas Horarias

❌ **Evitar**:
```javascript
const dateStr = selectedDate.toISOString().split('T')[0]; // ¡NO! Convierte a UTC
```

✅ **Correcto**:
```javascript
const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
```

### 2. Rotación de Turnos

El sistema usa un ciclo de 4 semanas que se repite indefinidamente:
- Semana 1: Patrón A
- Semana 2: Patrón B
- Semana 3: Patrón C
- Semana 4: Patrón D
- Luego vuelve a Semana 1

Cada semana, el personal rota automáticamente a diferentes turnos.

### 3. Fin de Semana vs Entre Semana

**Entre Semana (Lunes-Viernes)**:
- 9 programas diferentes
- Turnos variables según rotation_patterns
- Personal completo

**Fin de Semana (Sábado-Domingo)**:
- 5 programas reducidos
- 2 turnos fijos: 08:00-14:00 y 14:00-20:00
- Solo 2 personas por área

### 4. Prioridad de Novedades

Las novedades tienen prioridad sobre las asignaciones automáticas:
1. Sistema calcula turnos automáticos
2. Sistema verifica novedades activas
3. Si hay novedad, se muestra en rojo
4. Personal con novedad NO aparece en asignaciones

---

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│                     USUARIO                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
        ┌───────────────────────────────┐
        │   Selecciona Fecha/Semana     │
        └───────────────┬───────────────┘
                        │
                        ↓
        ┌───────────────────────────────────┐
        │  Frontend: ScheduleTable.jsx      │
        │  - Formatea fecha (zona local)    │
        │  - Detecta fin de semana          │
        └───────────────┬───────────────────┘
                        │
                        ↓
        ┌───────────────────────────────────┐
        │  API: /schedule/auto-shifts/date  │
        └───────────────┬───────────────────┘
                        │
                        ↓
        ┌───────────────────────────────────────────────┐
        │  Backend: scheduleController.js               │
        │  1. Calcula semana de rotación (1-4)          │
        │  2. Verifica si es fin de semana              │
        │     ├─ Sí → Turnos fijos 08-14, 14-20         │
        │     └─ No → Consulta rotation_patterns        │
        │  3. Obtiene personal activo                   │
        │  4. Asigna turnos según patrones              │
        └───────────────┬───────────────────────────────┘
                        │
                        ↓
        ┌────────────────────────────────┐
        │  PostgreSQL                    │
        │  - personnel                   │
        │  - rotation_patterns           │
        │  - novelties                   │
        └────────────────┬───────────────┘
                        │
                        ↓
        ┌────────────────────────────────┐
        │  Retorna turnos asignados      │
        └────────────────┬───────────────┘
                        │
                        ↓
        ┌────────────────────────────────────────┐
        │  Frontend: Renderiza tabla             │
        │  - Aplica novedades (fondo rojo)       │
        │  - Muestra asignaciones (fondo naranja)│
        │  - Permite edición manual              │
        └────────────────────────────────────────┘
```

---

## Próximos Pasos para Estudiar

1. **Comienza por el Backend**:
   - Lee `backend/server.js`
   - Explora `backend/routes/schedule.js`
   - Revisa `backend/controllers/scheduleController.js`

2. **Entiende la Base de Datos**:
   - Abre `backend/database/schema.sql`
   - Revisa `backend/database/seeds.sql`

3. **Explora el Frontend**:
   - Inicia en `src/App.jsx`
   - Revisa `src/components/Schedule/ScheduleTable.jsx`
   - Estudia los hooks en `src/hooks/`

4. **Prueba el Sistema**:
   - Ejecuta el backend: `cd backend && npm start`
   - Ejecuta el frontend: `npm run dev`
   - Experimenta con la interfaz

---

## Recursos Adicionales

- **API.md** - Documentación detallada de la API
- **DEPLOYMENT.md** - Guía de despliegue
- **backend/scripts/README.md** - Documentación de scripts

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0
