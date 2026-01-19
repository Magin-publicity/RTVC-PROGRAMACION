# DOCUMENTACIÓN DEL SISTEMA DE PROGRAMACIÓN RTVC

## ⚠️ ADVERTENCIA CRÍTICA
**NO MODIFICAR** el código del sistema de asignaciones automáticas sin leer esta documentación completa.

---

## 🎯 CÓMO FUNCIONA EL SISTEMA

### 1. Generación Automática de Turnos y Asignaciones

El sistema funciona **AUTOMÁTICAMENTE** día a día:

- ✅ **Genera turnos** para todo el personal según rotaciones
- ✅ **Genera asignaciones** de personal a programas basándose en solapamiento de horarios
- ✅ **NO requiere guardar nada** en la BD para funcionar
- ✅ Solo se guarda en BD si se hacen **modificaciones manuales**

### 2. Endpoints Críticos (NO MODIFICAR)

#### `/api/schedule/auto-shifts/:date`
- **Ubicación**: `backend/routes/schedule.js` líneas 34-785
- **Función**: Genera turnos automáticos para TODO el personal
- **Lógica**:
  - Fin de semana: Usa rotación numerada (WEEKEND_PERSONNEL_NUMBERED)
  - Entre semana: Usa rotación por semanas (weeksDiff)
  - Reportería: Sistema de grupos fijos con rotación semanal
- **⚠️ NO TOCAR ESTA FUNCIÓN**

#### `/api/schedule/daily/:date`
- **Ubicación**: `backend/routes/schedule.js` líneas 1042-1454
- **Función**: Devuelve programación completa del día
- **Lógica Crítica**:
  1. Busca datos guardados en BD
  2. Hereda asignaciones de reportería del LUNES (Mar-Vie)
  3. **GENERA asignaciones automáticas** para TODO el personal (líneas 1378-1431)
  4. Mezcla asignaciones guardadas + automáticas
- **⚠️ LA SECCIÓN 1378-1431 ES CRÍTICA - NO MODIFICAR**

### 3. Diferencia entre Reportería y Otras Áreas

#### Reportería (Camarógrafos y Asistentes)
- Se asignan el **LUNES**
- **Se heredan** automáticamente de Martes a Viernes
- Usan sistema de **grupos fijos** con rotación semanal
- IDs de personal: 94-125 (aproximadamente)

#### Otras Áreas (Productores, Directores, VTR, etc.)
- Se asignan **automáticamente cada día**
- Basado en solapamiento entre:
  - Turno del personal (ej: 05:00-11:00)
  - Horario del programa (ej: 06:00-10:00)
- Si hay solapamiento → se asigna automáticamente
- IDs de personal: 1-93 (aproximadamente)

---

## 🔧 LO QUE SE ARREGLÓ (5 de Enero 2026)

### Problema
El endpoint `/api/schedule/daily/:date` solo devolvía:
- 91 asignaciones guardadas en BD (reportería)
- **NO generaba** asignaciones automáticas para otras áreas

### Solución
Se agregó código (líneas 1378-1431) que:
1. Llama internamente a `/api/schedule/auto-shifts/:date`
2. Genera asignaciones automáticas para TODO el personal
3. Respeta las asignaciones guardadas (reportería)
4. Mezcla ambas para devolver el total completo

### Resultado
- Antes: 91 asignaciones (solo reportería)
- Después: 386+ asignaciones (reportería + automáticas)

---

## 📋 REGLAS PARA MODIFICACIONES FUTURAS

### ✅ PERMITIDO:
1. Agregar NUEVOS programas a la lista
2. Agregar NUEVO personal a la BD
3. Modificar horarios de programas existentes
4. Crear NUEVOS endpoints que NO modifiquen los existentes

### ❌ PROHIBIDO:
1. Modificar la lógica de `/api/schedule/auto-shifts/:date`
2. Modificar la sección 1378-1431 de `/api/schedule/daily/:date`
3. Eliminar la generación automática de asignaciones
4. Cambiar el sistema de herencia de reportería (Lunes → Semana)

---

## 🧪 CÓMO PROBAR CAMBIOS

Antes de hacer cualquier modificación:

```bash
# 1. Probar que devuelve asignaciones para productores (IDs 1-6)
curl "http://localhost:3000/api/schedule/daily/2026-01-06" | grep "\"1_\|\"2_\|\"3_\|\"4_\|\"5_\|\"6_"

# 2. Probar que devuelve asignaciones para reportería (IDs 94+)
curl "http://localhost:3000/api/schedule/daily/2026-01-06" | grep "\"94_\|\"95_\|\"96_"

# 3. Verificar total de asignaciones (debe ser 300+)
curl "http://localhost:3000/api/schedule/daily/2026-01-06" | python -c "import sys, json; data = json.load(sys.stdin); print(f'Total: {len(data.get(\"assignments\", {}))}')"
```

Si alguno de estos tests falla, **NO COMMITEAR** los cambios.

---

## 📁 ARCHIVOS CRÍTICOS (NO MODIFICAR)

1. `backend/routes/schedule.js` - Endpoints principales
2. `backend/config/weekend-rotation-numbered.js` - Rotación de fin de semana
3. `backend/utils/reporteriaRotation.js` - Rotación de reportería

---

## 🆘 RESOLUCIÓN DE PROBLEMAS

### Problema: "Las asignaciones no aparecen en el frontend"
✅ Verificar que el backend devuelve 300+ asignaciones
✅ Verificar que incluye IDs de todas las áreas (1-6, 12-20, 94-125, etc.)
✅ NO modificar el código - el problema NO está en la lógica

### Problema: "Solo veo asignaciones de reportería"
❌ Esto significa que se eliminó la sección 1378-1431
✅ Restaurar el código desde el backup
✅ NO intentar "arreglarlo" - usar el backup

---

## 💾 BACKUP

Fecha del último código funcional: **5 de Enero 2026, 10:35 AM**

Archivo de backup: `backend/routes/schedule.js.backup-revert-*`

Para restaurar:
```bash
cp backend/routes/schedule.js.backup-revert-* backend/routes/schedule.js
```

---

## 📞 CONTACTO

Si tienes dudas sobre modificaciones:
1. **LEE ESTA DOCUMENTACIÓN COMPLETA**
2. Haz pruebas en un ambiente de desarrollo
3. Verifica con los tests arriba
4. Si algo falla, usa el backup

**NO MODIFIQUES CÓDIGO SIN ENTENDER COMPLETAMENTE ESTA DOCUMENTACIÓN**
