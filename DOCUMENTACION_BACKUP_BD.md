# 📚 Sistema de Backup de Asignaciones en Base de Datos

## 🎯 ¿Qué problema resuelve?

Anteriormente, las asignaciones de Estudio y Master para cada programa se guardaban en el **localStorage del navegador**. Esto causaba problemas:

- ❌ Si borrabas los datos del navegador, perdías todas las asignaciones
- ❌ Solo funcionaba en un navegador específico
- ❌ No había respaldo real de los datos
- ❌ Los datos eran volátiles y podían perderse fácilmente

## ✅ La Solución: Backup en PostgreSQL

Ahora las asignaciones se guardan en la **base de datos PostgreSQL**, lo que significa:

- ✅ **Datos permanentes**: No se pierden aunque borres el navegador
- ✅ **Accesible desde cualquier dispositivo**: Las asignaciones están en el servidor
- ✅ **Backup real**: Los datos están respaldados en la base de datos profesional
- ✅ **Confiable**: PostgreSQL es una base de datos empresarial robusta

---

## 🔧 ¿Cómo Funciona?

### Tabla en PostgreSQL

Se creó una tabla llamada `program_mappings` con esta estructura:

```sql
program_id       | INTEGER (PK)  -- ID del programa
studio_resource  | INTEGER       -- Número del recurso de Estudio asignado
master_resource  | INTEGER       -- Número del recurso de Master asignado
updated_at       | TIMESTAMP     -- Última actualización
created_at       | TIMESTAMP     -- Fecha de creación
```

### Endpoints API

El backend ahora tiene estos endpoints:

- `GET /api/routes/program-mappings` - Obtiene todas las asignaciones
- `POST /api/routes/program-mappings` - Guarda/actualiza una asignación
- `DELETE /api/routes/program-mappings/:id` - Elimina una asignación
- `POST /api/routes/program-mappings/migrate` - Migra datos de localStorage a BD

---

## 📖 Guía de Uso

### 1️⃣ Primera Vez: Migrar Datos Existentes

**Importante**: Solo necesitas hacer esto **UNA VEZ** para transferir tus asignaciones actuales del navegador a la base de datos.

**Pasos:**

1. Abre la aplicación en el navegador
2. Ve a la sección **"Mapeo de Programas"** (en el menú lateral)
3. Verás un botón morado/índigo que dice **"Migrar a BD"**
4. Haz clic en ese botón
5. Aparecerá un mensaje de confirmación:
   ```
   💾 ¿Migrar asignaciones a la base de datos?

   Esto copiará todas tus asignaciones actuales de Estudio/Master
   desde el navegador (localStorage) a la base de datos PostgreSQL.

   ✅ Las asignaciones quedarán respaldadas permanentemente
   ⚠️ Solo necesitas hacer esto UNA VEZ

   ¿Continuar?
   ```
6. Confirma haciendo clic en **"Aceptar"**
7. Verás un mensaje de éxito:
   ```
   ✅ Migración exitosa!

   [X] asignaciones migradas a la base de datos

   Ahora tus datos están respaldados en PostgreSQL
   y ya no dependen del navegador.
   ```

**¡Listo!** Tus asignaciones ahora están en la base de datos.

---

### 2️⃣ Uso Normal: Guardar Cambios

Después de la migración inicial, el uso es exactamente igual que antes:

1. Ve a **"Mapeo de Programas"**
2. Asigna recursos de Estudio/Master a cada programa usando los dropdowns
3. Haz clic en **"Guardar Cambios"**
4. Ahora verás este mensaje mejorado:
   ```
   ✅ Mapeos guardados correctamente en la base de datos
   ```

**Diferencia importante**:
- ❌ Antes: Se guardaba en localStorage (navegador)
- ✅ Ahora: Se guarda en PostgreSQL (servidor)

---

## 🔍 ¿Qué hace el botón "Migrar a BD" exactamente?

### Proceso paso a paso:

1. **Lee** las asignaciones actuales del localStorage del navegador
2. **Envía** esas asignaciones al servidor mediante API REST
3. **Guarda** cada asignación en la tabla `program_mappings` de PostgreSQL
4. **Limpia** el localStorage del navegador (ya no es necesario)
5. **Recarga** los datos desde la base de datos

### Ejemplo práctico:

Imagina que tienes estas asignaciones en tu navegador:

```javascript
{
  "1": { studioResource: 5, masterResource: 5 },  // Calentado
  "3": { studioResource: 5, masterResource: 5 },  // Emisión RTVC Noticias
  "8": { studioResource: 5, masterResource: 5 }   // Emisión Central
}
```

Al hacer clic en "Migrar a BD", el sistema:

1. Lee estos datos del navegador
2. Los envía al servidor
3. Los guarda en PostgreSQL como:

```
| program_id | studio_resource | master_resource | updated_at          |
|------------|-----------------|-----------------|---------------------|
| 1          | 5               | 5               | 2026-01-20 15:30:00 |
| 3          | 5               | 5               | 2026-01-20 15:30:00 |
| 8          | 5               | 5               | 2026-01-20 15:30:00 |
```

---

## ⚠️ Preguntas Frecuentes

### ¿Tengo que hacer la migración cada vez que abro la app?

**No.** La migración es **una sola vez**. Después de eso, todos los datos se guardan automáticamente en la base de datos.

### ¿Qué pasa si ya migré y hago clic de nuevo en "Migrar a BD"?

El sistema detectará que no hay datos en localStorage y mostrará:
```
ℹ️ No hay datos en localStorage para migrar
```

### ¿Qué pasa si pierdo conexión al servidor?

El sistema tiene un **fallback inteligente**:
- Intenta guardar en la base de datos
- Si falla, guarda temporalmente en localStorage
- Cuando se recupere la conexión, puedes volver a guardar

### ¿Puedo borrar el caché del navegador después de migrar?

**¡Sí!** Ese es precisamente el beneficio. Tus asignaciones están en PostgreSQL, no en el navegador.

### ¿Los datos se sincronizan entre diferentes computadoras?

**Sí.** Como los datos están en el servidor, puedes acceder desde cualquier computadora y verás las mismas asignaciones.

---

## 🛠️ Para Desarrolladores

### Arquitectura del Sistema

```
┌─────────────────┐
│   NAVEGADOR     │
│                 │
│  ProgramMapping │
│     View.jsx    │
└────────┬────────┘
         │
         │ API REST
         ▼
┌─────────────────┐
│    SERVIDOR     │
│                 │
│  routes.js      │
│  (Express API)  │
└────────┬────────┘
         │
         │ SQL
         ▼
┌─────────────────┐
│   POSTGRESQL    │
│                 │
│ program_mappings│
│     TABLE       │
└─────────────────┘
```

### Archivos Modificados

**Backend:**
- `backend/routes/routes.js` - Endpoints CRUD para asignaciones
- `backend/database/create_program_mappings_table.sql` - Script de creación de tabla

**Frontend:**
- `src/services/programMappingService.js` - Service con async/await para API
- `src/components/ProgramMapping/ProgramMappingView.jsx` - Botón de migración
- `src/components/Schedule/ScheduleTable.jsx` - Carga asíncrona de mapeos

### Código Ejemplo: Guardar Asignación

```javascript
// Guardar asignación de un programa
const mapping = {
  studioResource: 5,
  masterResource: 5
};

await programMappingService.save(programId, mapping);
// ✅ Guardado en PostgreSQL automáticamente
```

---

## 📊 Beneficios del Sistema

| Característica | Antes (localStorage) | Ahora (PostgreSQL) |
|----------------|----------------------|-------------------|
| Persistencia | ❌ Temporal | ✅ Permanente |
| Backup | ❌ No | ✅ Sí |
| Multi-dispositivo | ❌ No | ✅ Sí |
| Confiabilidad | ⚠️ Baja | ✅ Alta |
| Velocidad | ✅ Rápida | ✅ Rápida |
| Escalabilidad | ❌ Limitada | ✅ Ilimitada |

---

## 📝 Resumen Ejecutivo

### ¿Qué cambió?

Las asignaciones de Estudio/Master ahora se guardan en PostgreSQL en lugar del navegador.

### ¿Qué debo hacer?

1. **Una sola vez**: Haz clic en "Migrar a BD" para transferir tus asignaciones actuales
2. **Uso normal**: Sigue usando "Guardar Cambios" como siempre

### ¿Qué gano?

- Datos permanentes y seguros
- Acceso desde cualquier dispositivo
- Backup automático en base de datos profesional

---

## 🎓 Conclusión

El botón **"Migrar a BD"** es una herramienta de **migración única** que traslada tus asignaciones del navegador a la base de datos PostgreSQL. Una vez hecho esto, todas las operaciones futuras se realizan automáticamente en la base de datos, brindándote un sistema robusto y confiable de gestión de asignaciones.

**Fecha de implementación**: 20 de Enero, 2026
**Versión**: 1.0
**Desarrollado por**: Claude Sonnet 4.5 & Juan Pablo

---

## 📞 Soporte

Si tienes problemas con la migración o el sistema de backup:

1. Revisa que el backend esté corriendo (puerto 3000)
2. Verifica la conexión a PostgreSQL
3. Consulta los logs de la consola del navegador (F12)
4. Revisa los logs del servidor backend

**Logs importantes a buscar:**
- `✅ Asignación guardada en BD:` - Guardado exitoso
- `❌ Error al guardar mapeo` - Error al guardar
- `✅ Migración completada` - Migración exitosa
