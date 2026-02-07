# 🔧 FIX: Problemas de Regeneración y Página en Blanco

**Fecha:** 2026-02-07
**Problemas Solucionados:**
1. Al regenerar se pierde lo que se guardó
2. Página en blanco al regresar a la aplicación

---

## 🐛 PROBLEMA 1: Herencia Sobrescribe Datos Guardados

### Descripción del Bug
Cuando el usuario guardaba cambios en un día (ej: martes) y luego regeneraba la programación, el sistema de herencia semanal sobrescribía los datos guardados con los datos del lunes, perdiendo todo el trabajo.

### Causa Raíz
La lógica de herencia semanal se ejecutaba **ANTES** de verificar si el día actual ya tenía datos propios guardados.

```javascript
// ❌ CÓDIGO ANTERIOR (INCORRECTO)
// La herencia se aplicaba sin verificar si el día tiene datos propios
if (currentDayOfWeek >= 2 && currentDayOfWeek <= 5) {
  // Buscar y copiar del lunes SIN verificar si el martes ya tiene datos
  const mondayData = await fetch(`${API_URL}/schedule/daily/${mondayDate}`);
  // ...copiar datos del lunes
}
```

### Solución Implementada
Agregamos verificación CRÍTICA: **solo heredar si el día NO tiene datos propios**.

**Orden de prioridad establecido:**
1. **Snapshot histórico propio** (daily_schedules_log)
2. **Datos temporales propios** (daily_schedules)
3. **Herencia de lunes/sábado**
4. **Generación desde rotación automática**

```javascript
// ✅ CÓDIGO NUEVO (CORRECTO)
// Verificar si este día tiene datos propios ANTES de heredar
const hasOwnData = savedData.found &&
                  savedData.assignments &&
                  Object.keys(savedData.assignments).length > 0;

if (hasOwnData) {
  console.log(`🚫 [HERENCIA] ${dateStr} YA tiene datos propios guardados - NO heredar`);
  // Mantener datos propios, no heredar
} else {
  // Solo si NO tiene datos propios, intentar heredar
  if (currentDayOfWeek >= 2 && currentDayOfWeek <= 5) {
    const mondayData = await fetch(`${API_URL}/schedule/daily/${mondayDate}`);
    // ...heredar solo si el día está vacío
  }
}
```

### Archivos Modificados
- `src/components/Schedule/ScheduleTable.jsx` (líneas 671-751)

---

## 🐛 PROBLEMA 2: Página en Blanco al Regresar

### Descripción del Bug
Cuando el usuario cerraba la pestaña o apagaba el computador y regresaba a la aplicación, la página aparecía en blanco. El usuario esperaba que la aplicación recordara en qué fecha estaba trabajando.

### Causa Raíz
El hook `useWeekNavigation` no persistía la fecha seleccionada. Cada vez que se recargaba la aplicación, volvía a la fecha actual por defecto.

```javascript
// ❌ CÓDIGO ANTERIOR (INCORRECTO)
export const useWeekNavigation = (initialDate = new Date()) => {
  // Siempre iniciaba con la fecha actual o la fecha inicial
  const [currentDate, setCurrentDate] = useState(initialDate);
  // ...sin persistencia
};
```

### Solución Implementada
Agregamos persistencia de la última fecha seleccionada usando `localStorage`.

**Características:**
- 📅 **Restaura última fecha** al recargar la página
- 💾 **Guarda automáticamente** cada cambio de fecha
- ✅ **Validación** de fechas restauradas
- 🔄 **Fallback** a fecha actual si hay error

```javascript
// ✅ CÓDIGO NUEVO (CORRECTO)
export const useWeekNavigation = (initialDate = new Date()) => {
  // Intentar restaurar la última fecha guardada
  const getInitialDate = () => {
    try {
      const savedDate = localStorage.getItem('rtvc_last_selected_date');
      if (savedDate) {
        const parsed = new Date(savedDate);
        if (!isNaN(parsed.getTime())) {
          console.log('📅 Restaurando última fecha:', savedDate);
          return parsed;
        }
      }
    } catch (error) {
      console.error('❌ Error restaurando fecha:', error);
    }
    return initialDate;
  };

  const [currentDate, setCurrentDate] = useState(getInitialDate);

  // Guardar la fecha cada vez que cambie
  useEffect(() => {
    try {
      const dateStr = currentDate.toISOString();
      localStorage.setItem('rtvc_last_selected_date', dateStr);
      console.log('💾 Fecha guardada:', dateStr);
    } catch (error) {
      console.error('❌ Error guardando fecha:', error);
    }
  }, [currentDate]);

  // ...resto del código
};
```

### Archivos Modificados
- `src/hooks/useWeekNavigation.js` (todo el archivo)

---

## ✅ RESULTADOS

### Problema 1: Regeneración
**ANTES:**
- Usuario guarda martes con asignaciones personalizadas
- Usuario regenera programación
- ❌ Los datos del martes se pierden, sobrescritos por el lunes

**DESPUÉS:**
- Usuario guarda martes con asignaciones personalizadas
- Usuario regenera programación
- ✅ Los datos del martes se mantienen intactos (no heredan del lunes)
- ✅ Solo días vacíos heredan del lunes/sábado

### Problema 2: Página en Blanco
**ANTES:**
- Usuario trabaja en fecha 2026-02-15
- Usuario cierra pestaña/computador
- Usuario abre aplicación
- ❌ Aparece fecha actual (2026-02-07), no donde estaba trabajando

**DESPUÉS:**
- Usuario trabaja en fecha 2026-02-15
- Usuario cierra pestaña/computador
- Usuario abre aplicación
- ✅ Aparece fecha 2026-02-15, exactamente donde estaba trabajando

---

## 🧪 CÓMO PROBAR

### Test 1: Herencia NO sobrescribe guardado
1. Ir al lunes 2026-02-10
2. Asignar persona X al programa Y
3. Guardar cambios (botón "Guardar")
4. Ir al martes 2026-02-11
5. Hacer asignaciones DIFERENTES al lunes
6. Guardar cambios
7. Regenerar rotación
8. **VERIFICAR:** El martes mantiene sus asignaciones propias (no copia del lunes)

### Test 2: Herencia funciona para días vacíos
1. Ir al lunes 2026-02-10
2. Asignar persona X al programa Y
3. Guardar cambios
4. Ir al miércoles 2026-02-12 (sin datos guardados)
5. **VERIFICAR:** El miércoles hereda automáticamente del lunes

### Test 3: Persistencia de fecha
1. Ir a fecha futura (ej: 2026-03-15)
2. Cerrar pestaña del navegador
3. Abrir aplicación de nuevo
4. **VERIFICAR:** La aplicación abre en 2026-03-15 (donde estabas)

### Test 4: Persistencia tras reinicio
1. Ir a fecha pasada (ej: 2026-01-20)
2. Apagar computador
3. Encender computador y abrir aplicación
4. **VERIFICAR:** La aplicación abre en 2026-01-20 (donde estabas)

---

## 📊 LOGS DE CONSOLA

### Cuando un día tiene datos propios (NO hereda)
```
🚫 [HERENCIA] 2026-02-11 YA tiene datos propios guardados - NO heredar
   📋 Tiene 15 asignaciones propias
   🔒 Se mantendrán sus datos originales
```

### Cuando un día está vacío (SÍ hereda)
```
📅 [HERENCIA] 2026-02-12 sin datos propios - buscando lunes 2026-02-10...
✅ [HERENCIA] Lunes 2026-02-10 tiene snapshot guardado - copiando...
   📋 Asignaciones: 15
   ⏰ CallTimes: 20
   ⏰ EndTimes: 20
✅ [HERENCIA] Datos heredados del lunes exitosamente
🎯 [HERENCIA] Programación heredada de lunes 2026-02-10 - no generar rotación automática
```

### Cuando se guarda/restaura fecha
```
💾 [useWeekNavigation] Fecha guardada: 2026-02-15T00:00:00.000Z
📅 [useWeekNavigation] Restaurando última fecha: 2026-02-15T00:00:00.000Z
```

---

## 🔐 IMPACTO EN EL SISTEMA

### ✅ Funcionalidades NO Afectadas
- ✅ Guardado de programación (sigue funcionando igual)
- ✅ Snapshot puro histórico (sigue respetando datos guardados)
- ✅ Auto-asignación al cambiar horarios (sigue funcionando)
- ✅ Rutas, alimentación, LiveU, dashboard (sin cambios)
- ✅ Herencia semanal (mejorada, no rota)

### 🆕 Funcionalidades Mejoradas
- 🆕 Herencia respeta datos guardados (no sobrescribe)
- 🆕 Persistencia de fecha seleccionada
- 🆕 Mejor experiencia de usuario (no perder contexto)

---

## 📝 NOTAS TÉCNICAS

### localStorage Keys Usadas
- `rtvc_last_selected_date`: Guarda la última fecha seleccionada en formato ISO

### Consideraciones
- La persistencia de fecha usa `localStorage`, que tiene límite de ~5-10MB (más que suficiente para una fecha)
- La fecha se guarda en formato ISO para evitar problemas de zona horaria
- Si localStorage falla (navegador en modo privado), usa fecha actual como fallback
- La validación `!isNaN(parsed.getTime())` previene fechas inválidas

### Orden de Ejecución
1. Usuario abre aplicación
2. `useWeekNavigation` restaura fecha de localStorage
3. React renderiza con fecha restaurada
4. `ScheduleTable` carga datos para esa fecha
5. Verificación: ¿tiene datos propios? → Sí: usar propios / No: heredar

---

## 👥 RETROALIMENTACIÓN DEL USUARIO

**Problema reportado:**
> "porque cuando dejo de manipular la pagina y el compu y vuelvo a abrirla esta en blanco no deberia pasar deberia estar donde quede y al regenerar se pierde lo que hice"

**Solución implementada:**
✅ Página ya NO está en blanco - recuerda última fecha
✅ Regenerar ya NO pierde datos guardados - respeta datos propios

---

## 🎯 CONCLUSIÓN

Ambos problemas han sido solucionados:

1. **Herencia inteligente**: Solo hereda cuando el día está vacío, respeta datos guardados
2. **Persistencia de contexto**: Recuerda dónde estabas trabajando al regresar

La aplicación ahora se comporta como Excel: **respeta lo que guardaste** y **recuerda donde estabas**.
