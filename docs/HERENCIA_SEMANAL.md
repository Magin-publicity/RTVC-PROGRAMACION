# 📅 Sistema de Herencia Semanal

## 🎯 Concepto

El sistema ahora implementa **herencia automática inteligente** para facilitar la programación semanal:

- **Martes a Viernes** → Heredan del LUNES
- **Domingo** → Hereda del SÁBADO

## 🔄 Flujo de Carga

### Prioridad de Carga (en orden):

```
1. ¿Este día tiene snapshot guardado?
   ✅ SÍ → Cargar snapshot (modo Excel puro)
   ❌ NO ↓

2. ¿Es martes, miércoles, jueves o viernes?
   ✅ SÍ → Buscar lunes de esta semana
           ¿Lunes tiene snapshot guardado?
           ✅ SÍ → Copiar del lunes
           ❌ NO ↓

3. ¿Es domingo?
   ✅ SÍ → Buscar sábado anterior
           ¿Sábado tiene snapshot guardado?
           ✅ SÍ → Copiar del sábado
           ❌ NO ↓

4. ¿Es lunes o sábado?
   → Generar desde rotación automática
```

## 📋 Ejemplos de Uso

### Ejemplo 1: Semana Normal

```
LUNES 2 FEB:
1. Abres lunes 2 feb
2. Sistema genera rotación automática (no hay snapshot)
3. Ajustas manualmente según proyectos del día
4. Guardas

MARTES 3 FEB:
1. Abres martes 3 feb
2. Sistema busca lunes 2 feb
3. Encuentra snapshot guardado del lunes
4. Copia EXACTAMENTE: assignments, callTimes, endTimes, manual flags
5. Ajustas según eventos del martes
6. Guardas

MIÉRCOLES 4 FEB:
1. Abres miércoles 4 feb
2. Sistema busca lunes 2 feb (NO el martes)
3. Copia del lunes
4. Ajustas y guardas

JUEVES/VIERNES:
→ Mismo proceso: heredan del LUNES (no del día anterior)
```

### Ejemplo 2: Fin de Semana

```
SÁBADO 7 FEB:
1. Abres sábado
2. Sistema genera rotación de fin de semana (no hay snapshot)
3. Ajustas según proyectos
4. Guardas

DOMINGO 8 FEB:
1. Abres domingo
2. Sistema busca sábado 7 feb
3. Encuentra snapshot guardado del sábado
4. Copia EXACTAMENTE todo del sábado
5. Ajustas si necesario
6. Guardas
```

### Ejemplo 3: Lunes sin Guardar

```
MARTES 3 FEB (sin lunes guardado):
1. Abres martes 3 feb
2. Sistema busca lunes 2 feb
3. Lunes NO tiene snapshot guardado
4. Sistema genera rotación automática para el martes
5. Funciona como antes (sin herencia)
```

## 🎬 Logs de Diagnóstico

### Cuando hereda del lunes:

```
📅 [HERENCIA] Es Mar, buscando lunes 2026-02-02...
✅ [HERENCIA] Lunes 2026-02-02 tiene snapshot guardado - copiando...
   📋 Asignaciones: 469
   ⏰ CallTimes: 145
   ⏰ EndTimes: 145
✅ [HERENCIA] Datos heredados del lunes exitosamente
🎯 [HERENCIA] Programación heredada de lunes 2026-02-02 - no generar rotación automática
```

### Cuando NO hay herencia:

```
📅 [HERENCIA] Es Mar, buscando lunes 2026-02-02...
⚠️ [HERENCIA] Lunes 2026-02-02 no tiene snapshot guardado - generando desde rotación
🔧 [GENERACIÓN] No hay herencia disponible - generando desde rotación automática
```

### Cuando carga snapshot propio:

```
📸 [SNAPSHOT HISTÓRICO] Modo Excel Puro - SIN recálculo
(No busca herencia - usa su propio snapshot)
```

## ✅ Ventajas

| Aspecto | Beneficio |
|---------|-----------|
| **Consistencia** | Toda la semana parte del mismo patrón (lunes) |
| **Menos trabajo** | Armas el lunes, la semana se copia automáticamente |
| **Flexibilidad** | Cada día se puede ajustar independientemente |
| **Seguridad** | Si el lunes no existe, no rompe nada |
| **Independencia** | Cada día guardado tiene su propio snapshot |

## 🔧 Implementación Técnica

### Funciones Helper:

```javascript
// Calcular lunes de la semana
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${month}-${day}`;
};

// Calcular sábado anterior
const getSaturday = (date) => {
  const d = new Date(date);
  const saturday = new Date(d);
  saturday.setDate(d.getDate() - 1);
  return `${saturday.getFullYear()}-${month}-${day}`;
};
```

### Lógica de Herencia:

```javascript
// Martes (2) a Viernes (5)
if (currentDayOfWeek >= 2 && currentDayOfWeek <= 5) {
  const mondayDate = getMondayOfWeek(selectedDate);
  const mondayData = await fetch(`/api/schedule/daily/${mondayDate}`);

  if (mondayData.found && mondayData.fromHistory) {
    // Copiar del lunes
    setAssignments(mondayData.assignments);
    setCallTimes(mondayData.callTimes);
    setEndTimes(mondayData.endTimes);
    // ... etc
    return; // No generar rotación
  }
}

// Domingo (0)
else if (currentDayOfWeek === 0) {
  const saturdayDate = getSaturday(selectedDate);
  // ... mismo proceso
}

// Si no heredó, generar rotación automática
```

## 📊 Casos de Prueba

### Test 1: Heredar del Lunes
```
1. Guardar lunes 2 feb con Marilú 10:00-19:00
2. Abrir martes 3 feb
3. Verificar: Marilú aparece 10:00-19:00
4. Verificar logs: "Heredado de lunes 2026-02-02"
```

### Test 2: Heredar del Sábado
```
1. Guardar sábado 7 feb con Juan Carlos 08:00-16:00
2. Abrir domingo 8 feb
3. Verificar: Juan Carlos aparece 08:00-16:00
4. Verificar logs: "Heredado de sábado 2026-02-07"
```

### Test 3: Sin Herencia (Lunes sin Guardar)
```
1. NO guardar el lunes 2 feb
2. Abrir martes 3 feb
3. Verificar: Genera rotación automática
4. Verificar logs: "No hay herencia - generando desde rotación"
```

### Test 4: Snapshot Propio Tiene Prioridad
```
1. Guardar lunes con datos A
2. Guardar martes con datos B (diferentes)
3. Volver a abrir martes
4. Verificar: Muestra datos B (su propio snapshot)
5. No hereda del lunes
```

## 🎯 Flujo de Trabajo Recomendado

### Semana Normal:

```
Lunes →
  1. Generas rotación automática
  2. Ajustas según proyectos
  3. Guardas (se convierte en base de la semana)

Martes-Viernes →
  1. Abres → Se copia del lunes automáticamente
  2. Ajustas según eventos del día
  3. Guardas (snapshot independiente)
```

### Fin de Semana:

```
Sábado →
  1. Generas rotación fin de semana
  2. Ajustas
  3. Guardas (base del fin de semana)

Domingo →
  1. Abres → Se copia del sábado automáticamente
  2. Ajustas si necesario
  3. Guardas
```

## 🔒 Garantías

- ✅ **No rompe nada**: Si no hay lunes/sábado guardado, genera normal
- ✅ **Independencia**: Cada día guardado es independiente
- ✅ **Modo Excel**: Lo guardado nunca se sobrescribe automáticamente
- ✅ **Editable**: Heredar no bloquea edición

## 📝 Notas Importantes

1. **Herencia vs Snapshot**:
   - Herencia = Copiar de otro día cuando NO tienes guardado
   - Snapshot = Tu propio guardado (siempre tiene prioridad)

2. **Miércoles hereda del LUNES**, no del martes
   - Esto mantiene consistencia semanal
   - Si necesitas partir del martes, guardas el miércoles con esos datos

3. **El domingo hereda del sábado**, no del lunes
   - Fin de semana es independiente de la semana laboral

4. **Lunes y sábado NUNCA heredan**
   - Siempre generan rotación automática (si no tienen guardado)
   - Son las "bases" de la semana y fin de semana

## ✅ Estado: IMPLEMENTADO

- Archivo: `src/components/Schedule/ScheduleTable.jsx`
- Líneas agregadas: ~90 líneas
- Funciones helper: getMondayOfWeek(), getSaturday()
- Fecha: 2026-02-07
