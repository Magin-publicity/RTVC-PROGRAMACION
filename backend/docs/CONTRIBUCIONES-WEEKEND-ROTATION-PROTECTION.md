# ⚠️ SISTEMA DE ROTACIÓN - PROTECCIÓN CRÍTICA ⚠️

## 🔒 SISTEMA PROTEGIDO - NO MODIFICAR

Este documento explica las medidas de protección implementadas para prevenir que el sistema de rotación (tanto de fin de semana como de entre semana) se rompa con modificaciones futuras.

### Sistemas Protegidos:
1. **Rotación de Fin de Semana** - CONTRIBUCIONES (3 semanas, 2 trabajan, 1 descansa)
2. **Rotación de Entre Semana** - Todas las áreas (plantillas de 4/5/6 turnos, grupos fijos)

---

## 📋 Requisitos del Sistema

### 1. Rotación de Fin de Semana - CONTRIBUCIONES (3 Semanas)

**Personal:**
- Adrian Contreras (#3)
- Michael Torres (#1)
- Carolina Benavides (#2)

**Patrón de Rotación (basado en weekendCount % 3):**

| Rotación | Turno 1 (08:00-14:00) | Turno 2 (14:00-20:00) | Descansa |
|----------|----------------------|----------------------|----------|
| Semana 0 (weekendCount % 3 = 0) | Adrian | Carolina | Michael |
| Semana 1 (weekendCount % 3 = 1) | Michael | Adrian | Carolina |
| Semana 2 (weekendCount % 3 = 2) | Carolina | Michael | Adrian |

**Reglas Críticas:**
- Solo 2 personas trabajan cada fin de semana
- 1 persona descansa y NO aparece en el schedule (sin callTime, sin turno, sin asignaciones)
- Turnos de 6 horas: T1 (08:00-14:00), T2 (14:00-20:00)
- Solo fines de semana (sábado y domingo)
- NO afecta rotación de entre semana

### 2. Rotación de Entre Semana - Todas las Áreas

**Tipos de Rotación:**

1. **Áreas con 5 personas** (ej: Algunas áreas técnicas)
   - Plantilla de 5 turnos fijos: 05:00, 09:00, 13:00, 16:00, 18:00
   - Cada persona avanza un turno cada semana
   - Rotación basada en `weeksDiff` (semanas desde fecha base)

2. **Áreas con 6 personas** (ej: Algunas áreas técnicas)
   - Plantilla de 6 turnos fijos: 05:00, 09:00, 11:00, 13:00, 15:00, 18:00
   - Cada persona avanza un turno cada semana
   - Rotación basada en `weeksDiff`

3. **Reportería** (Camarógrafos y Asistentes)
   - Sistema de grupos fijos: GRUPO_A y GRUPO_B
   - Alternan entre turnos AM (08:00-14:00) y PM (14:00-20:00) cada semana
   - weeksDiff par: GRUPO_A → AM, GRUPO_B → PM
   - weeksDiff impar: GRUPO_A → PM, GRUPO_B → AM

4. **Otras áreas**
   - Rotación basada en patrones de base de datos
   - Ciclo de 4 semanas (semana 1, 2, 3, 4)

**Reglas Críticas:**
- Fecha base: 4 de noviembre 2025 (Lunes, Semana 0)
- weeksDiff se calcula desde la fecha base
- Ciclo de 4 semanas para patrones (`currentWeek = (weeksDiff % 4) + 1`)
- NO modificar lógicas especiales por área

---

## 🛡️ Medidas de Protección Implementadas

### 1. Archivo de Constantes Compartidas

**Ubicación:** `backend/config/rotation-constants.js`

Este archivo centraliza:
- `WEEKEND_ROTATION_BASE_DATE`: Fecha base para rotación de fin de semana (2025-11-04)
- `WEEKDAY_ROTATION_BASE_DATE`: Fecha base para rotación de entre semana (2025-11-04)
- `validateWeekendBaseDate()`: Valida fecha base de fin de semana
- `validateWeekdayBaseDate()`: Valida fecha base de entre semana
- `calculateWeekendCount()`: Calcula weekendCount de forma consistente
- `calculateWeeksDiff()`: Calcula weeksDiff de forma consistente

**⚠️ NUNCA modificar las fechas base `2025-11-04T12:00:00`**

Si cambias estas fechas:
- ❌ Fin de semana: Los turnos y callTimes usarán diferentes weekendCount
- ❌ Entre semana: Toda la rotación se romperá (plantillas, grupos, patrones)
- ❌ La rotación se desincronizará
- ❌ Las asignaciones serán incorrectas

### 2. Validación Automática

En cada cálculo de rotación, el sistema valida que las fechas base no hayan sido modificadas:

**Para fin de semana:**
```javascript
validateWeekendBaseDate(WEEKEND_ROTATION_BASE_DATE);
const weekendCount = calculateWeekendCount(selectedDate);
```

**Para entre semana:**
```javascript
validateWeekdayBaseDate(WEEKDAY_ROTATION_BASE_DATE);
const weeksDiff = calculateWeeksDiff(mondayOfWeek);
```

Si detecta un cambio, el sistema:
1. ❌ Lanza un error crítico
2. 🚨 Imprime advertencias en consola indicando qué fecha base es incorrecta
3. 🛑 Detiene la ejecución

### 3. Comentarios de Advertencia

Todas las secciones críticas tienen comentarios claramente marcados:

```javascript
// ⚠️⚠️⚠️ CRÍTICO - NO MODIFICAR ESTA SECCIÓN ⚠️⚠️⚠️
```

### 4. Sincronización Entre Endpoints

**Dos endpoints trabajan juntos:**

#### `/api/schedule/auto-shifts/:date`
- **Ubicación:** `backend/routes/schedule.js` líneas 315-398
- **Función:** Genera los turnos (shifts) de fin de semana
- **Usa:** `WEEKEND_ROTATION_BASE_DATE` para calcular weekendCount
- **Crea:** 2 shifts (uno para cada persona que trabaja)

#### `/api/schedule/daily/:date`
- **Ubicación:** `backend/routes/schedule.js` líneas 1332-1423
- **Función:** Calcula callTimes (horarios de llegada)
- **Usa:** `WEEKEND_ROTATION_BASE_DATE` para calcular weekendCount
- **Crea:** 2 callTimes (uno para cada persona que trabaja)

**⚠️ Ambos endpoints DEBEN usar la misma fecha base o se romperá la sincronización**

### 5. Protección Contra Sobrescritura

**Ubicación:** `backend/routes/schedule.js` líneas 1426-1451

Después de calcular los callTimes correctos para CONTRIBUCIONES, hay código que recalcula callTimes desde la base de datos. Este código tiene un CHECK que previene sobrescribir CONTRIBUCIONES:

```javascript
if (shift.area === 'CONTRIBUCIONES') {
  console.log(`   ⏭️ Saltando sobrescritura de callTime para ${shift.area} (fin de semana)`);
  return; // No sobrescribir
}
```

**⚠️ NO eliminar este check o los callTimes correctos serán sobrescritos**

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ Error 1: Cambiar la fecha base

```javascript
// ❌ MAL - No hacer esto
const baseDate = new Date('2025-12-13T12:00:00');

// ✅ BIEN - Usar la constante compartida
const baseDate = new Date(WEEKEND_ROTATION_BASE_DATE);
```

### ❌ Error 2: Calcular weekendCount diferente

```javascript
// ❌ MAL - Cálculo manual puede introducir errores
const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
const weekendCount = Math.floor(daysDiff / 7);

// ✅ BIEN - Usar la función helper
const weekendCount = calculateWeekendCount(selectedDate);
```

### ❌ Error 3: Modificar el patrón de rotación

```javascript
// ❌ MAL - Cambiar el patrón rompe la sincronización
if (rotationWeek === 0) {
  t1Person = 'Michael Torres';  // Incorrecto!
}

// ✅ BIEN - Mantener el patrón documentado
if (rotationWeek === 0) {
  t1Person = 'Adrian Contreras';  // Correcto según rotación
}
```

### ❌ Error 4: Eliminar el check de sobrescritura

```javascript
// ❌ MAL - Esto causará que los callTimes sean sobrescritos
programsData.shifts.forEach(shift => {
  callTimes[shift.personnel_id] = shift.shift_start;
});

// ✅ BIEN - Con el check de protección
programsData.shifts.forEach(shift => {
  if (dayOfWeekNum === 0 || dayOfWeekNum === 6) {
    if (shift.area === 'CONTRIBUCIONES') {
      return; // No sobrescribir
    }
  }
  callTimes[shift.personnel_id] = shift.shift_start;
});
```

---

## ✅ CÓMO VERIFICAR QUE TODO FUNCIONA

### Test Manual

1. Abrir la aplicación y navegar a un fin de semana
2. Verificar que CONTRIBUCIONES tiene exactamente 2 personas con turnos
3. Verificar que los turnos son 08:00-14:00 y 14:00-20:00
4. Verificar que los callTimes coinciden con los turnos (08:00 y 14:00)
5. Verificar que las asignaciones están correctas (programas se asignan según overlap con turnos)
6. Verificar que la tercera persona NO aparece (sin callTime, sin turno, sin asignaciones)

### Verificar Rotación

Para verificar que la rotación sigue el patrón correcto:

```javascript
// En consola del navegador o backend logs:
// Debe mostrar el patrón correcto según la fecha
console.log(`Rotación #${weekendCount}, Patrón: ${rotationWeek}`);
```

| Fecha | weekendCount | rotationWeek | T1 (08:00) | T2 (14:00) | Descansa |
|-------|-------------|-------------|-----------|-----------|----------|
| 2025-11-09 (Sábado) | 0 | 0 | Adrian | Carolina | Michael |
| 2025-11-16 (Sábado) | 1 | 1 | Michael | Adrian | Carolina |
| 2025-11-23 (Sábado) | 2 | 2 | Carolina | Michael | Adrian |
| 2025-11-30 (Sábado) | 3 | 0 | Adrian | Carolina | Michael |

---

## 🔧 SI ALGO SE ROMPE

### Síntomas de Rotación Rota

1. **Turnos y callTimes no coinciden**
   - Causa probable: Fechas base diferentes
   - Solución: Verificar que ambos endpoints usen `WEEKEND_ROTATION_BASE_DATE`

2. **Todos aparecen con callTime (3 personas en vez de 2)**
   - Causa probable: Se eliminó la lógica de borrar callTimes previos
   - Solución: Verificar líneas 1362-1370 en schedule.js

3. **CallTimes correctos pero asignaciones incorrectas**
   - Causa probable: Asignaciones viejas en base de datos
   - Solución: Ejecutar script de limpieza `backend/scripts/clean-contrib-weekend-assignments.js`

4. **Patrón de rotación incorrecto**
   - Causa probable: Se modificó la lógica de rotación
   - Solución: Verificar que el patrón sigue siendo:
     - rotationWeek 0 → Adrian + Carolina
     - rotationWeek 1 → Michael + Adrian
     - rotationWeek 2 → Carolina + Michael

### Script de Limpieza

Si las asignaciones están incorrectas en la base de datos:

```bash
cd backend
node scripts/clean-contrib-weekend-assignments.js
```

Este script:
1. Encuentra todos los fines de semana en la DB
2. Elimina todas las asignaciones de CONTRIBUCIONES
3. Las asignaciones se regeneran automáticamente al recargar la página

---

## 📚 Archivos Relacionados

| Archivo | Propósito | Líneas Críticas |
|---------|-----------|----------------|
| `backend/config/rotation-constants.js` | Constantes compartidas y validación | Todo el archivo |
| `backend/routes/schedule.js` | Generación de turnos (auto-shifts) | 44-54, 315-398 |
| `backend/routes/schedule.js` | Cálculo de callTimes (daily) | 1332-1423 |
| `backend/routes/schedule.js` | Protección contra sobrescritura | 1426-1451 |
| `backend/scripts/clean-contrib-weekend-assignments.js` | Limpieza de asignaciones | Todo el archivo |
| `backend/config/weekend-rotation-numbered.js` | Configuración de personal | 130-134 |

---

## 📞 Contacto

Si encuentras un problema con la rotación de CONTRIBUCIONES:

1. ✅ NO modificar el código sin entender las protecciones
2. ✅ Revisar este documento primero
3. ✅ Verificar que las constantes no hayan sido modificadas
4. ✅ Ejecutar el script de limpieza si es necesario
5. ✅ Contactar al desarrollador original si el problema persiste

---

## 📝 Historial de Cambios

### 2026-01-06
- ✅ Implementada rotación de 3 semanas para CONTRIBUCIONES
- ✅ Sincronizadas fechas base entre endpoints
- ✅ Agregadas validaciones y protecciones
- ✅ Creado script de limpieza de asignaciones
- ✅ Documentado sistema de protección

---

**⚠️ RECUERDA: Este sistema está sincronizado entre múltiples endpoints. Cualquier cambio en una parte puede romper todo el sistema. Siempre consulta este documento antes de modificar código relacionado con CONTRIBUCIONES en fines de semana.**
