# Mapa de Estudio - Sistema RTVC

## 🎯 Plan de Estudio Sugerido (Por Niveles)

### Nivel 1: Principiante (1-2 días)

```
┌─────────────────────────────────────────────────────────┐
│                    DÍA 1: ENTENDIMIENTO BÁSICO          │
└─────────────────────────────────────────────────────────┘

Mañana (2-3 horas):
├─ 1. Lee: GUIA-RAPIDA.md
│  └─ Tiempo: 20 minutos
│  └─ Objetivo: Entender qué hace el sistema
│
├─ 2. Instala el proyecto
│  └─ Tiempo: 30 minutos
│  └─ Objetivo: Tener todo corriendo localmente
│
└─ 3. Explora la interfaz
   └─ Tiempo: 1 hora
   └─ Tareas:
      ├─ Crear personal
      ├─ Crear novedad
      ├─ Ver programación
      └─ Navegar entre semanas

Tarde (2-3 horas):
├─ 4. Lee: README.md (docs/)
│  └─ Tiempo: 15 minutos
│  └─ Objetivo: Entender la estructura de docs
│
├─ 5. Lee: ARQUITECTURA.md - Secciones básicas
│  └─ Tiempo: 1 hora
│  └─ Secciones:
│     ├─ Visión General
│     ├─ Estructura del Proyecto
│     └─ Stack Tecnológico
│
└─ 6. Experimenta con el código
   └─ Tiempo: 1 hora
   └─ Tareas:
      ├─ Abre src/App.jsx
      ├─ Encuentra el componente ScheduleTable
      ├─ Agrega un console.log()
      └─ Observa el resultado en el navegador
```

### Nivel 2: Intermedio (3-5 días)

```
┌─────────────────────────────────────────────────────────┐
│              DÍA 2-3: ARQUITECTURA FRONTEND              │
└─────────────────────────────────────────────────────────┘

├─ 1. Lee: ARQUITECTURA.md - Arquitectura Frontend
│  └─ Tiempo: 2 horas
│  └─ Objetivo: Entender React, Hooks, Services
│
├─ 2. Estudia los Hooks personalizados
│  └─ Tiempo: 2 horas
│  └─ Archivos:
│     ├─ src/hooks/usePersonnel.js
│     ├─ src/hooks/useSchedule.js
│     ├─ src/hooks/useNovelties.js
│     └─ src/hooks/useWeekNavigation.js
│  └─ Tarea: Dibuja un diagrama de cómo interactúan
│
├─ 3. Estudia los Services
│  └─ Tiempo: 1 hora
│  └─ Archivos:
│     ├─ src/services/api.js
│     ├─ src/services/scheduleService.js
│     └─ src/services/personnelService.js
│  └─ Tarea: Haz una llamada API desde la consola
│
└─ 4. Profundiza en ScheduleTable.jsx
   └─ Tiempo: 3 horas
   └─ Tareas:
      ├─ Lee el componente completo
      ├─ Entiende el useEffect de carga de turnos
      ├─ Entiende cómo se muestran las novedades
      └─ Modifica un color y observa el cambio

┌─────────────────────────────────────────────────────────┐
│              DÍA 4-5: ARQUITECTURA BACKEND               │
└─────────────────────────────────────────────────────────┘

├─ 1. Lee: ARQUITECTURA.md - Arquitectura Backend
│  └─ Tiempo: 2 horas
│  └─ Objetivo: Entender MVC, rutas, controladores
│
├─ 2. Estudia el flujo de una request
│  └─ Tiempo: 2 horas
│  └─ Archivos:
│     ├─ backend/server.js
│     ├─ backend/routes/schedule.js
│     ├─ backend/controllers/scheduleController.js
│     └─ backend/models/Schedule.js
│  └─ Tarea: Traza el flujo de GET /api/schedule/auto-shifts/:date
│
├─ 3. Estudia la base de datos
│  └─ Tiempo: 2 horas
│  └─ Archivos:
│     ├─ backend/database/schema.sql
│     └─ backend/database/seeds.sql
│  └─ Tareas:
│     ├─ Conecta a psql
│     ├─ Ejecuta queries manualmente
│     ├─ SELECT * FROM personnel;
│     ├─ SELECT * FROM rotation_patterns;
│     └─ Entiende las relaciones
│
└─ 4. Profundiza en el algoritmo de rotación
   └─ Tiempo: 2 horas
   └─ Archivo: backend/routes/schedule.js
   └─ Tareas:
      ├─ Lee la función auto-shifts
      ├─ Entiende el cálculo de semana
      ├─ Entiende la diferencia fin de semana vs entre semana
      └─ Agrega console.log() para ver el flujo
```

### Nivel 3: Avanzado (5-7 días)

```
┌─────────────────────────────────────────────────────────┐
│                 DÍA 6-7: FLUJOS COMPLEJOS                │
└─────────────────────────────────────────────────────────┘

├─ 1. Lee: DIAGRAMAS.md - Todos los diagramas
│  └─ Tiempo: 2 horas
│  └─ Objetivo: Visualizar todos los flujos
│
├─ 2. Estudia el Flujo de Rotación completo
│  └─ Tiempo: 3 horas
│  └─ Documentos:
│     ├─ DIAGRAMAS.md - Flujo de carga de programación
│     └─ ARQUITECTURA.md - Flujo de Rotación de Turnos
│  └─ Tareas:
│     ├─ Dibuja el flujo en papel
│     ├─ Identifica cada paso en el código
│     └─ Cambia la fecha base y observa el efecto
│
├─ 3. Estudia el manejo de Novedades
│  └─ Tiempo: 2 horas
│  └─ Tareas:
│     ├─ Crea una novedad desde la UI
│     ├─ Observa la request en DevTools (Network)
│     ├─ Sigue el flujo en el backend
│     ├─ Verifica en la base de datos
│     └─ Observa cómo afecta la programación
│
└─ 4. Estudia el problema de Zonas Horarias
   └─ Tiempo: 2 horas
   └─ Documentos:
      ├─ DIAGRAMAS.md - Manejo de Zonas Horarias
      └─ ARQUITECTURA.md - Consideraciones Técnicas
   └─ Tareas:
      ├─ Entiende por qué toISOString() es problemático
      ├─ Encuentra todas las correcciones en el código
      └─ Prueba crear fechas con diferentes métodos

┌─────────────────────────────────────────────────────────┐
│              DÍA 8-10: PROYECTO PRÁCTICO                 │
└─────────────────────────────────────────────────────────┘

Proyecto: Agregar una nueva funcionalidad

Opción A: Agregar "Días Festivos"
├─ Frontend:
│  ├─ Crear componente HolidayForm
│  ├─ Agregar vista de Días Festivos
│  └─ Modificar ScheduleTable para detectar festivos
│
├─ Backend:
│  ├─ Crear tabla holidays
│  ├─ Crear rutas /api/holidays
│  ├─ Crear controlador holidayController
│  └─ Modificar auto-shifts para detectar festivos
│
└─ Base de Datos:
   ├─ Crear migration
   ├─ Agregar seeds
   └─ Actualizar schema.sql

Opción B: Agregar "Historial de Cambios"
├─ Frontend:
│  ├─ Crear componente ChangeLog
│  └─ Mostrar en modal
│
├─ Backend:
│  ├─ Crear tabla change_log
│  ├─ Agregar triggers para auditar cambios
│  └─ Crear endpoint para obtener historial
│
└─ Base de Datos:
   ├─ Crear tabla change_log
   ├─ Agregar triggers en personnel, schedules, novelties
   └─ Crear índices apropiados
```

---

## 🗺️ Mapa Mental del Sistema

```
                    SISTEMA RTVC
                         │
          ┌──────────────┼──────────────┐
          │              │              │
      FRONTEND        BACKEND      BASE DE DATOS
          │              │              │
    ┌─────┴─────┐   ┌────┴────┐    ┌────┴────┐
    │           │   │         │    │         │
  React      Vite  Express  Node  PostgreSQL
    │                 │              │
    │                 │              │
┌───┴───┐         ┌───┴───┐      ┌───┴───┐
│       │         │       │      │       │
App  Components  Routes  Models  Tables  Triggers
│       │         │       │      │
│       │         │       │      └─ personnel
│       │         │       │         novelties
│   ┌───┴───┐     │       │         schedules
│   │       │     │       │         rotation_patterns
│ Layout Schedule │       │
│   │       │     │       │
│ Header Table    │       └─ personnelController
│ Sidebar Cell    │          scheduleController
│   │       │     │          noveltyController
│   │       │     │
│   │       │  ┌──┴──┐
│   │       │  │     │
│   │       │ GET  POST
│   │       │ PUT  DELETE
│   │       │
│   │       └─ Hooks ──┐
│   │          │       │
│   │      useSchedule │
│   │      usePersonnel│
│   │      useNovelties│
│   │          │       │
│   │          └───────┴─ Services ──┐
│   │                     │          │
│   │                 API Client  HTTP
│   │                     │
│   └─────────────────────┘
│
└─ Componentes
   │
   ├─ Calendar/
   │  ├─ Calendar.jsx
   │  ├─ DatePicker.jsx
   │  └─ WeekSelector.jsx
   │
   ├─ Novelties/
   │  ├─ NoveltyForm.jsx
   │  ├─ NoveltyList.jsx
   │  └─ NoveltyModal.jsx
   │
   ├─ Personnel/
   │  ├─ PersonnelForm.jsx
   │  ├─ PersonnelList.jsx
   │  └─ PersonnelModal.jsx
   │
   └─ Schedule/
      ├─ ScheduleTable.jsx ⭐ (Principal)
      ├─ ScheduleCell.jsx
      └─ ScheduleRow.jsx
```

---

## 🎓 Checklist de Aprendizaje

Marca ✅ cuando domines cada concepto:

### Frontend

- [ ] Entiendo cómo funciona React y los componentes
- [ ] Entiendo cómo funcionan los Hooks (useState, useEffect)
- [ ] Entiendo los Custom Hooks del proyecto
- [ ] Entiendo cómo se hacen llamadas a la API
- [ ] Entiendo el componente ScheduleTable
- [ ] Entiendo cómo se renderizan las novedades
- [ ] Entiendo cómo se formatean las fechas (zona local)
- [ ] Puedo agregar un nuevo componente
- [ ] Puedo modificar estilos con Tailwind

### Backend

- [ ] Entiendo el patrón MVC
- [ ] Entiendo cómo funcionan las rutas (Express)
- [ ] Entiendo cómo funcionan los controladores
- [ ] Entiendo cómo funcionan los modelos
- [ ] Entiendo el algoritmo de rotación de 4 semanas
- [ ] Entiendo la diferencia fin de semana vs entre semana
- [ ] Entiendo cómo se calculan los turnos automáticos
- [ ] Entiendo el manejo de fechas en el backend
- [ ] Puedo agregar un nuevo endpoint
- [ ] Puedo hacer debug de errores

### Base de Datos

- [ ] Entiendo el esquema de la BD
- [ ] Entiendo las relaciones entre tablas
- [ ] Entiendo los índices y constraints
- [ ] Puedo escribir queries complejas
- [ ] Entiendo los triggers
- [ ] Puedo crear migraciones
- [ ] Puedo optimizar queries

### Conceptos del Negocio

- [ ] Entiendo qué es una "novedad"
- [ ] Entiendo cómo funciona la rotación de turnos
- [ ] Entiendo la diferencia entre áreas y roles
- [ ] Entiendo los diferentes tipos de programas
- [ ] Entiendo por qué hay turnos diferentes en fin de semana
- [ ] Entiendo la prioridad de las novedades
- [ ] Puedo explicar el sistema a otra persona

---

## 📚 Recursos por Tema

### Rotación de Turnos

```
Documentos:
├─ ARQUITECTURA.md
│  └─ Sección: "Flujo de Rotación de Turnos"
│
├─ DIAGRAMAS.md
│  ├─ "Ciclo de Rotación de 4 Semanas"
│  └─ "Flujo de Carga de Programación"
│
└─ Código:
   ├─ backend/routes/schedule.js (líneas 88-166)
   └─ backend/database/seeds.sql (rotation_patterns)

Ejercicio Práctico:
1. Cambia la fecha base en schedule.js
2. Observa cómo cambian las semanas
3. Crea un script que imprima la semana para cualquier fecha
```

### Manejo de Novedades

```
Documentos:
├─ ARQUITECTURA.md
│  └─ "Flujo de Creación de Novedad"
│
├─ DIAGRAMAS.md
│  └─ "Flujo de Creación de Novedad"
│
└─ Código:
   ├─ src/components/Novelties/NoveltyForm.jsx
   ├─ backend/controllers/noveltyController.js
   └─ backend/routes/schedule.js (líneas 445-463)

Ejercicio Práctico:
1. Crea una novedad de 5 días
2. Observa el efecto en la programación
3. Verifica en la BD: SELECT * FROM novelties;
4. Modifica el color de las novedades en ScheduleTable
```

### Zona Horaria

```
Documentos:
├─ ARQUITECTURA.md
│  └─ "Manejo de Zonas Horarias"
│
├─ DIAGRAMAS.md
│  └─ "Manejo de Zonas Horarias (Importante)"
│
└─ Código:
   ├─ backend/routes/schedule.js (líneas 250-255)
   ├─ src/components/Schedule/ScheduleTable.jsx (líneas 53-54, 449-450)
   └─ src/utils/dateUtils.js

Ejercicio Práctico:
1. Prueba toISOString() vs formato manual
2. Cambia la hora del sistema y observa diferencias
3. Crea una función helper para formatear fechas
```

---

## 🎯 Proyecto Final Sugerido

### Proyecto: Sistema de Intercambio de Turnos

Objetivo: Permitir que el personal intercambie turnos entre ellos.

**Requisitos**:
1. Un empleado puede solicitar intercambio de turno
2. Otro empleado de la misma área puede aceptar
3. Se registra el intercambio en la BD
4. La programación se actualiza automáticamente

**Archivos a crear**:

Frontend:
- `src/components/Shifts/ShiftExchangeModal.jsx`
- `src/components/Shifts/ShiftExchangeList.jsx`
- `src/hooks/useShiftExchange.js`
- `src/services/shiftExchangeService.js`

Backend:
- `backend/routes/shiftExchange.js`
- `backend/controllers/shiftExchangeController.js`
- `backend/models/ShiftExchange.js`
- `backend/database/migrations/add-shift-exchanges.sql`

**Skills que demuestras**:
- ✅ Crear componentes React
- ✅ Usar hooks personalizados
- ✅ Hacer llamadas API
- ✅ Crear endpoints backend
- ✅ Modificar base de datos
- ✅ Integrar con sistema existente

**Tiempo estimado**: 2-3 días

---

## 📖 Lecturas Complementarias

### Tecnologías

- **React**: https://react.dev/learn
- **Express**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Conceptos

- **Patrón MVC**: https://en.wikipedia.org/wiki/Model-view-controller
- **REST API**: https://restfulapi.net/
- **React Hooks**: https://react.dev/reference/react
- **SQL Joins**: https://www.postgresql.org/docs/current/tutorial-join.html

---

**¡Buena suerte con tu estudio! 🚀**
