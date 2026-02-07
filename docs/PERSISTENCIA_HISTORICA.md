# Sistema de Persistencia Histórica - RTVC Programming

## 📸 Concepto

El sistema ahora implementa **persistencia histórica real** donde cada día guardado es una "fotografía" inmutable que preserva exactamente cómo estaba la programación ese día, independientemente de cambios futuros.

## 🎯 Funcionamiento

### Cuando presionas "Guardar"

1. **Captura el estado actual completo:**
   - Todas las asignaciones (quién está en qué programa)
   - Horas de entrada y salida (callTimes)
   - Asignaciones y horarios manuales
   - Programas configurados

2. **Captura snapshot de novedades activas:**
   - Busca todas las novedades (incapacidades, permisos, etc.) que estaban activas ese día
   - Las guarda como parte del snapshot

3. **Guarda en dos lugares:**
   - `daily_schedules`: Tabla temporal (puede cambiar)
   - `daily_schedules_log`: **Tabla histórica INMUTABLE** (nunca cambia)

### Cuando navegas por el calendario

El sistema carga los datos en este orden de prioridad:

1. **PRIORIDAD 1:** Datos guardados en `daily_schedules_log` (histórico)
   - Si existe, muestra EXACTAMENTE lo que guardaste ese día
   - Incluye las novedades tal como estaban ese día
   - **Independiente** del estado actual de novedades

2. **PRIORIDAD 2:** Datos en `daily_schedules` (temporal)
   - Si no hay histórico pero hay datos temporales

3. **PRIORIDAD 3:** Generación automática
   - Si no hay ningún dato guardado, genera basado en la rotación estándar

## ✅ Casos de Uso

### Ejemplo 1: Incapacidad que ya terminó

**Escenario:**
- El 15 de enero, Juan tiene incapacidad
- Guardas la programación (Juan aparece como incapacitado)
- Hoy es 20 de enero, la incapacidad ya terminó y la borraste
- Vuelves a ver el 15 de enero

**Resultado:**
- ✅ Juan aparece INCAPACITADO (tal como se guardó ese día)
- ✅ La programación es idéntica a la que guardaste
- ✅ No importa que hoy la novedad ya no exista

### Ejemplo 2: Cambio manual de horario

**Escenario:**
- El 10 de enero cambias manualmente el horario de María de 08:00 a 09:00
- Guardas la programación
- Hoy reseteas los horarios a los estándar
- Vuelves a ver el 10 de enero

**Resultado:**
- ✅ María aparece con horario 09:00 (tu cambio manual guardado)
- ✅ El horario no se recalcula basado en la rotación actual

## 🔒 Independencia de Novedades

Las novedades en el snapshot son **completamente independientes** de la tabla `novelties` actual:

- Si borras una novedad hoy, seguirá apareciendo en días pasados donde se guardó
- Si agregas una novedad nueva, NO aparece en días pasados ya guardados
- Cada día es una "cápsula del tiempo" independiente

## 📊 Estructura de Datos

### Tabla `daily_schedules_log`

```sql
CREATE TABLE daily_schedules_log (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  assignments_data JSONB NOT NULL,  -- Incluye assignments + callTimes + manualFlags
  programs JSONB,                    -- Programas y turnos configurados
  novelties_snapshot JSONB,          -- Snapshot de novedades activas ese día
  saved_by VARCHAR(255),
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);
```

### Snapshot de Novedades

Ejemplo de lo que se guarda:

```json
[
  {
    "personnel_id": 123,
    "name": "Juan Pérez",
    "area": "CAMARÓGRAFOS",
    "novelty_type": "INCAPACIDAD",
    "start_date": "2026-01-10",
    "end_date": "2026-01-15",
    "description": "Incapacidad médica"
  },
  {
    "personnel_id": 456,
    "name": "María González",
    "area": "ASISTENTES",
    "novelty_type": "PERMISO",
    "start_date": "2026-01-10",
    "end_date": "2026-01-10",
    "description": "Permiso personal"
  }
]
```

## 🔧 API Endpoints Modificados

### POST `/api/schedule/daily/:date`

**Antes:**
- Solo guardaba en `daily_schedules`

**Ahora:**
1. Captura snapshot de novedades activas
2. Guarda en `daily_schedules` (temporal)
3. Guarda en `daily_schedules_log` (histórico)

### GET `/api/schedule/daily/:date`

**Antes:**
- Buscaba en `daily_schedules`
- Si no había, generaba automáticamente

**Ahora:**
1. **Primero** busca en `daily_schedules_log` (histórico)
2. Si no existe, busca en `daily_schedules` (temporal)
3. Si no existe, genera automáticamente

**Respuesta cuando hay histórico:**
```json
{
  "found": true,
  "fromHistory": true,
  "date": "2026-01-15",
  "assignments": { ... },
  "callTimes": { ... },
  "manualCallTimes": { ... },
  "manualAssignments": { ... },
  "programs": [ ... ],
  "shifts": [ ... ],
  "noveltiesSnapshot": [ ... ],  // Las novedades tal como estaban ese día
  "savedAt": "2026-01-15T18:30:00Z"
}
```

## 🚀 Migración de Datos Existentes

La migración automáticamente:
- Crea la tabla `daily_schedules_log`
- Migra todos los datos existentes de `daily_schedules` a `daily_schedules_log`
- Preserva las fechas de actualización como fechas de guardado

**Nota:** Los datos migrados no tendrán snapshot de novedades (será array vacío), pero los nuevos guardados sí.

## 📝 Notas Importantes

1. **Un día = Un snapshot:** Cada fecha solo puede tener un registro histórico
2. **Guardado sobrescribe:** Si guardas el mismo día dos veces, se sobrescribe el histórico
3. **Inmutabilidad relativa:** El histórico se puede actualizar, pero solo cuando el usuario presiona "Guardar" explícitamente
4. **Frontend no cambia:** El componente React sigue funcionando igual, solo recibe `fromHistory: true` en la respuesta

## 🎬 Próximos Pasos

Para usar completamente esta funcionalidad, el frontend podría:

1. Mostrar un indicador visual cuando se están viendo datos históricos
2. Mostrar la fecha/hora en que se guardó el snapshot
3. Agregar opción para "restaurar" un día histórico
4. Implementar comparación entre histórico vs. rotación actual

## 📅 Ejemplo Completo

```
15 de enero 2026:
- Juan: Incapacitado (01/10 - 01/15)
- María: Horario manual 09:00
- Programas: Noticias AM, Cultura PM
[GUARDADO] ✅

20 de enero 2026:
- Se borra la incapacidad de Juan (ya terminó)
- Se resetean horarios de María a estándar

15 de enero 2026 (navegación):
[CARGA HISTÓRICO] 📸
- Juan: INCAPACITADO ← Del snapshot
- María: 09:00 ← Del snapshot
- Programas: Noticias AM, Cultura PM
✅ Idéntico a como se guardó
```
