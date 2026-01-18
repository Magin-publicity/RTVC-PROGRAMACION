# Diagramas del Sistema RTVC

## 1. Diagrama de Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              FRONTEND (React + Vite)                    │  │
│  │                                                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │   App    │  │ Schedule │  │Personnel │            │  │
│  │  │   .jsx   │→ │  Table   │  │   List   │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  │       ↓              ↓              ↓                  │  │
│  │  ┌────────────────────────────────────────┐           │  │
│  │  │         Custom Hooks                   │           │  │
│  │  │  useSchedule | usePersonnel | ...      │           │  │
│  │  └────────────────────────────────────────┘           │  │
│  │       ↓              ↓              ↓                  │  │
│  │  ┌────────────────────────────────────────┐           │  │
│  │  │            Services                     │           │  │
│  │  │  scheduleService | personnelService     │           │  │
│  │  └────────────────────────────────────────┘           │  │
│  └─────────────────────────┬────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │ HTTP/REST API
                             │ (JSON)
┌────────────────────────────┼───────────────────────────────┐
│                            ↓                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │         BACKEND (Node.js + Express)                 │   │
│  │                                                     │   │
│  │  server.js                                          │   │
│  │     ↓                                               │   │
│  │  ┌────────────────────────────────┐                │   │
│  │  │          ROUTES                │                │   │
│  │  │  /api/personnel                │                │   │
│  │  │  /api/schedule                 │                │   │
│  │  │  /api/novelties                │                │   │
│  │  │  /api/reports                  │                │   │
│  │  └───────────┬────────────────────┘                │   │
│  │              ↓                                      │   │
│  │  ┌────────────────────────────────┐                │   │
│  │  │        CONTROLLERS             │                │   │
│  │  │  personnelController           │                │   │
│  │  │  scheduleController            │                │   │
│  │  │  noveltyController             │                │   │
│  │  └───────────┬────────────────────┘                │   │
│  │              ↓                                      │   │
│  │  ┌────────────────────────────────┐                │   │
│  │  │          MODELS                │                │   │
│  │  │  Personnel                     │                │   │
│  │  │  Schedule                      │                │   │
│  │  │  Novelty                       │                │   │
│  │  └───────────┬────────────────────┘                │   │
│  └──────────────┼───────────────────────────────────┘    │
└─────────────────┼──────────────────────────────────────┘
                  │ SQL Queries
                  │ (pg driver)
┌─────────────────┼──────────────────────────────────────┐
│                 ↓                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │            PostgreSQL DATABASE                    │  │
│  │                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │personnel │  │schedules │  │novelties │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  │  ┌──────────┐  ┌──────────┐                     │  │
│  │  │rotation_ │  │rotation_ │                     │  │
│  │  │patterns  │  │ config   │                     │  │
│  │  └──────────┘  └──────────┘                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 2. Flujo de Datos: Carga de Programación

```
┌─────────────────┐
│ Usuario abre    │
│ la aplicación   │
└────────┬────────┘
         │
         ↓
┌────────────────────────┐
│ App.jsx se monta       │
│ - useState('schedule') │
│ - useWeekNavigation()  │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────────────┐
│ useWeekNavigation()            │
│ - currentDate = new Date()     │
│ - Calcula semana actual        │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ ScheduleTable.jsx recibe:      │
│ - selectedDate                 │
│ - personnel (de usePersonnel)  │
│ - novelties (de useNovelties)  │
└────────┬───────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ useEffect(() => {}, [selectedDate])     │
│                                         │
│ 1. Formatea fecha (zona local)         │
│    const dateStr = YYYY-MM-DD           │
│                                         │
│ 2. Detecta día de la semana             │
│    const isWeekend = day === 0 || 6     │
│                                         │
│ 3. Selecciona programas                 │
│    programs = isWeekend ?               │
│      WEEKEND_PROGRAMS : WEEKDAY_PROGRAMS│
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│ fetch('/api/schedule/auto-shifts/DATE') │
└────────┬────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────┐
│ Backend: scheduleController.js               │
│                                              │
│ const selectedDate = new Date(date+'T12:00') │
│ const dayOfWeek = selectedDate.getDay()      │
│                                              │
│ if (dayOfWeek === 0 || dayOfWeek === 6) {   │
│   // FIN DE SEMANA                           │
│   return weekendShifts()                     │
│ } else {                                     │
│   // ENTRE SEMANA                            │
│   return calculateRotation()                 │
│ }                                            │
└────────┬─────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ FIN DE SEMANA                          │
│                                        │
│ 1. SELECT * FROM personnel             │
│    WHERE active = true                 │
│                                        │
│ 2. Agrupar por área                    │
│                                        │
│ 3. Asignar 2 personas por área:        │
│    - Persona 1 → 08:00-14:00          │
│    - Persona 2 → 14:00-20:00          │
│                                        │
│ 4. Return shifts[]                     │
└────────────────────────────────────────┘

         ↓
┌────────────────────────────────────────┐
│ ENTRE SEMANA                           │
│                                        │
│ 1. Calcular semana de rotación:        │
│    baseDate = 2025-11-10 (Semana 1)   │
│    daysDiff = (today - baseDate)       │
│    weeks = daysDiff / 7                │
│    currentWeek = (weeks % 4) + 1       │
│                                        │
│ 2. SELECT * FROM rotation_patterns     │
│    WHERE week_number = currentWeek     │
│                                        │
│ 3. SELECT * FROM personnel             │
│    WHERE active = true                 │
│                                        │
│ 4. Para cada persona:                  │
│    - Calcular índice base              │
│    - Rotar según semana                │
│    - Asignar turno                     │
│                                        │
│ 5. Return shifts[]                     │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ Frontend recibe shifts[]               │
│                                        │
│ shiftsData.forEach(shift => {         │
│   const time = shift.shift_start      │
│   callTimes[personnel_id] = time      │
│                                       │
│   // Asignar a programas en el turno │
│   programs.forEach(program => {       │
│     if (program.time >= start &&      │
│         program.time < end) {         │
│       assignments[id_program] = true  │
│     }                                 │
│   })                                  │
│ })                                    │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ Verificar novedades                    │
│                                        │
│ novelties.find(n => {                 │
│   if (personnel_id matches &&         │
│       todayStr >= start_date &&       │
│       todayStr <= end_date) {         │
│     return true // Tiene novedad      │
│   }                                   │
│ })                                    │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ Renderizar tabla                       │
│                                        │
│ {personnel.map(person => {            │
│   {programs.map(program => {          │
│                                       │
│     if (hasNovelty) {                 │
│       return <Cell bg="red">          │
│                 {novelty.description}  │
│              </Cell>                  │
│     }                                 │
│                                       │
│     if (isAssigned) {                 │
│       return <Cell bg="orange">       │
│                 ASIGNADO              │
│              </Cell>                  │
│     }                                 │
│                                       │
│     return <Cell bg="white" />        │
│   })}                                 │
│ })}                                   │
└────────────────────────────────────────┘
```

## 3. Ciclo de Rotación de 4 Semanas

```
┌─────────────────────────────────────────────────────────────┐
│              CICLO DE ROTACIÓN (4 SEMANAS)                   │
└─────────────────────────────────────────────────────────────┘

Fecha Base: 10 de noviembre 2025 = SEMANA 1

┌──────────────────────────────────────────────────────────────┐
│ SEMANA 1 │ SEMANA 2 │ SEMANA 3 │ SEMANA 4 │ SEMANA 1 │ ... │
├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤
│          │          │          │          │          │     │
│ Persona A│ Persona A│ Persona A│ Persona A│ Persona A│     │
│ Turno 1  │ Turno 2  │ Turno 3  │ Turno 1  │ Turno 2  │ ... │
│ 06-14    │ 08-16    │ 14-22    │ 06-14    │ 08-16    │     │
│          │          │          │          │          │     │
│ Persona B│ Persona B│ Persona B│ Persona B│ Persona B│     │
│ Turno 2  │ Turno 3  │ Turno 1  │ Turno 2  │ Turno 3  │ ... │
│ 08-16    │ 14-22    │ 06-14    │ 08-16    │ 14-22    │     │
│          │          │          │          │          │     │
│ Persona C│ Persona C│ Persona C│ Persona C│ Persona C│     │
│ Turno 3  │ Turno 1  │ Turno 2  │ Turno 3  │ Turno 1  │ ... │
│ 14-22    │ 06-14    │ 08-16    │ 14-22    │ 06-14    │     │
└──────────┴──────────┴──────────┴──────────┴──────────┴─────┘

Ejemplo con fechas reales:

10-nov-2025 (Lun) = Semana 1
17-nov-2025 (Lun) = Semana 2
24-nov-2025 (Lun) = Semana 3
01-dic-2025 (Lun) = Semana 4
08-dic-2025 (Lun) = Semana 1 (se repite el ciclo)
```

## 4. Modelo de Base de Datos (Relacional)

```
┌─────────────────────────────┐
│        personnel            │
├─────────────────────────────┤
│ PK │ id                     │
│    │ name                   │
│    │ role                   │
│    │ area                   │
│    │ current_shift          │
│    │ active                 │
│    │ created_at             │
│    │ updated_at             │
└──────────┬──────────────────┘
           │ 1
           │
           │ N
┌──────────┴──────────────────┐
│        novelties            │
├─────────────────────────────┤
│ PK │ id                     │
│ FK │ personnel_id           │
│    │ start_date             │
│    │ end_date               │
│    │ type                   │
│    │ description            │
│    │ created_at             │
└──────────┬──────────────────┘
           │
           │
           │ N
┌──────────┴──────────────────┐
│        schedules            │
├─────────────────────────────┤
│ PK │ id                     │
│ FK │ personnel_id           │
│    │ date                   │
│    │ shift_start            │
│    │ shift_end              │
│    │ program_id             │
│    │ created_at             │
└─────────────────────────────┘


┌─────────────────────────────┐
│    rotation_patterns        │
├─────────────────────────────┤
│ PK │ id                     │
│    │ area                   │
│    │ week_number (1-4)      │
│    │ shift_start            │
│    │ shift_end              │
│    │ created_at             │
└─────────────────────────────┘

┌─────────────────────────────┐
│     rotation_config         │
├─────────────────────────────┤
│ PK │ id                     │
│    │ current_week (1-4)     │
│    │ week_start_date        │
│    │ updated_at             │
└─────────────────────────────┘
```

## 5. Flujo de Creación de Novedad

```
┌─────────────────┐
│ Usuario hace    │
│ clic en "Nueva  │
│ Novedad"        │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ NoveltyModal se abre    │
│ - Formulario vacío      │
│ - Estado: isOpen=true   │
└────────┬────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Usuario llena formulario:    │
│ - Selecciona personal        │
│ - Selecciona tipo            │
│ - Fecha inicio: 2025-12-10   │
│ - Fecha fin: 2025-12-15      │
│ - Descripción: "Vacaciones"  │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Validación Frontend:         │
│ ✓ Personnel seleccionado     │
│ ✓ Tipo seleccionado          │
│ ✓ end_date >= start_date     │
│ ✓ Fechas no están vacías     │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ handleSubmit()                   │
│ POST /api/novelties              │
│ Body: {                          │
│   personnel_id: 5,               │
│   type: "vacaciones",            │
│   start_date: "2025-12-10",      │
│   end_date: "2025-12-15",        │
│   description: "Vacaciones"      │
│ }                                │
└────────┬─────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Backend: noveltyController.create  │
│                                    │
│ 1. Validar datos recibidos         │
│ 2. Verificar que personnel existe  │
│ 3. INSERT INTO novelties (...)     │
│ 4. RETURNING *                     │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ PostgreSQL                         │
│ INSERT INTO novelties              │
│ VALUES (                           │
│   DEFAULT,              -- id      │
│   5,                    -- pers_id │
│   '2025-12-10',         -- start   │
│   '2025-12-15',         -- end     │
│   'vacaciones',         -- type    │
│   'Vacaciones',         -- desc    │
│   CURRENT_TIMESTAMP     -- created │
│ )                                  │
│ RETURNING *;                       │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Backend retorna:                   │
│ {                                  │
│   id: 42,                          │
│   personnel_id: 5,                 │
│   start_date: "2025-12-10",        │
│   end_date: "2025-12-15",          │
│   type: "vacaciones",              │
│   description: "Vacaciones",       │
│   created_at: "2025-12-09..."      │
│ }                                  │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Frontend: useNovelties             │
│                                    │
│ setNovelties([                     │
│   ...novelties,                    │
│   newNovelty                       │
│ ])                                 │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Modal se cierra                    │
│ Lista de novedades se actualiza    │
│ ScheduleTable re-renderiza         │
│ Muestra novedad en rojo            │
│ del 10 al 15 de diciembre          │
└────────────────────────────────────┘
```

## 6. Comparación: Entre Semana vs Fin de Semana

```
┌─────────────────────────────────────────────────────────────┐
│                    LUNES - VIERNES                           │
└─────────────────────────────────────────────────────────────┘

Programas: 9 emisiones diferentes
Horarios: 06:00 - 22:00

┌──────────────────────────────────────────────────────────┐
│ Programa              │ Hora  │ Personal Asignado        │
├───────────────────────┼───────┼──────────────────────────┤
│ Calentado             │ 06:00 │ Turno 06-14 (mañana)     │
│ Avance Informativo    │ 11:00 │ Turno 06-14 (mañana)     │
│ Emisión RTVC Mañana   │ 12:00 │ Turno 06-14 (mañana)     │
│ Avance Informativo    │ 15:30 │ Turno 08-16 (tarde)      │
│ Avance Informativo    │ 17:00 │ Turno 08-16 (tarde)      │
│ Avance Informativo    │ 18:00 │ Turno 14-22 (noche)      │
│ Emisión Central       │ 19:00 │ Turno 14-22 (noche)      │
│ Noches de Opinión     │ 20:00 │ Turno 14-22 (noche)      │
│ Última Emisión        │ 21:30 │ Turno 14-22 (noche)      │
└───────────────────────┴───────┴──────────────────────────┘

Personal: TODO el personal según rotation_patterns
Rotación: Cambia cada semana (ciclo 1-2-3-4)


┌─────────────────────────────────────────────────────────────┐
│                    SÁBADO - DOMINGO                          │
└─────────────────────────────────────────────────────────────┘

Programas: 5 emisiones reducidas
Horarios: 12:00 - 19:30

┌──────────────────────────────────────────────────────────┐
│ Programa              │ Hora  │ Personal Asignado        │
├───────────────────────┼───────┼──────────────────────────┤
│ Avance Informativo    │ 12:00 │ Turno 08-14 (mañana)     │
│ Emisión RTVC Mediodía │ 12:30 │ Turno 08-14 (mañana)     │
│ Avance Informativo    │ 13:30 │ Turno 08-14 (mañana)     │
│ Avance Informativo    │ 18:30 │ Turno 14-20 (tarde)      │
│ Emisión RTVC Noche    │ 19:00 │ Turno 14-20 (tarde)      │
└───────────────────────┴───────┴──────────────────────────┘

Personal: Solo 2 personas por área
Rotación: Turnos fijos, NO cambia

Ejemplo por área:
PRODUCTORES:
  - Juan Pérez   → 08:00-14:00
  - María López  → 14:00-20:00

DIRECTORES DE CÁMARA:
  - Carlos Ruiz  → 08:00-14:00
  - Ana García   → 14:00-20:00
```

## 7. Manejo de Zonas Horarias (Importante)

```
┌──────────────────────────────────────────────────────────┐
│              PROBLEMA DE ZONA HORARIA                     │
└──────────────────────────────────────────────────────────┘

❌ INCORRECTO:
const dateStr = selectedDate.toISOString().split('T')[0];

Problema:
- toISOString() convierte a UTC
- Colombia es UTC-5
- Domingo 14-dic-2025 a las 02:00 AM (Colombia)
  se convierte en:
  Sábado 13-dic-2025 a las 07:00 AM (UTC)
- El string resultante es '2025-12-13' ❌

┌──────────────────────────────────────────────────────────┐
│                    SOLUCIÓN                               │
└──────────────────────────────────────────────────────────┘

✅ CORRECTO:
const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

Ventajas:
- Usa la fecha LOCAL (no UTC)
- Domingo 14-dic-2025 → '2025-12-14' ✓
- Siempre mantiene el día correcto
- No hay desplazamiento de fechas

REGLA DE ORO:
Siempre usar getFullYear(), getMonth(), getDate()
NUNCA usar toISOString() para obtener fechas
```

---

**Última actualización**: Diciembre 2025
